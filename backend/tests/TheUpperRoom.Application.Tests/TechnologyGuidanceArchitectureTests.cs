using System.Reflection;
using System.Text.RegularExpressions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using TheUpperRoom.Application;
using TheUpperRoom.Infrastructure.Seeding;

namespace TheUpperRoom.Application.Tests;

public sealed class TechnologyGuidanceArchitectureTests
{
    private static readonly Regex TypeDeclarationPattern = new(
        @"^\s*(?:(?:public|internal|private|protected|sealed|abstract|static|partial|readonly|file)\s+)*(?:(?:record\s+(?:class\s+|struct\s+)?)|class\s+|interface\s+|enum\s+|struct\s+)([A-Za-z_][A-Za-z0-9_]*)",
        RegexOptions.Compiled);

    private static readonly string[] RestrictedApiSuffixes =
    [
        "Handler",
        "Command",
        "Query",
        "Validator",
        "DbContext",
        "DataSeeder",
    ];

    private static readonly HashSet<string> MultiTypeFileAllowList = new(StringComparer.OrdinalIgnoreCase);

    private static readonly HashSet<string> RestrictedApiTypeAllowList = new(StringComparer.Ordinal);

    [Fact]
    public void Backend_source_files_do_not_add_new_multi_type_files()
    {
        var root = FindRepoRoot();
        var sourceRoot = Path.Combine(root, "backend", "src");
        var violations = Directory.GetFiles(sourceRoot, "*.cs", SearchOption.AllDirectories)
            .Where(file => !IsBuildArtifact(file))
            .Select(file => new
            {
                Path = NormalizePath(root, file),
                Count = File.ReadLines(file).Count(line => TypeDeclarationPattern.IsMatch(line)),
            })
            .Where(file => file.Count > 1 && !MultiTypeFileAllowList.Contains(file.Path))
            .Select(file => $"{file.Path} declares {file.Count} top-level types")
            .ToArray();

        Assert.Empty(violations);
    }

    [Fact]
    public void Api_does_not_add_new_application_or_infrastructure_types()
    {
        var root = FindRepoRoot();
        var apiRoot = Path.Combine(root, "backend", "src", "TheUpperRoom.Api");
        var violations = Directory.GetFiles(apiRoot, "*.cs", SearchOption.AllDirectories)
            .Where(file => !IsBuildArtifact(file))
            .SelectMany(file =>
            {
                // ASP.NET HTTP-pipeline handlers (e.g. IExceptionHandler) are not
                // CQRS handlers and intentionally live in Api/. Filter those out by
                // requiring the file to mention MediatR's IRequestHandler before
                // counting "*Handler" suffixes as Application-shape types.
                var content = File.ReadAllText(file);
                var isMediatRFile = content.Contains("IRequestHandler", StringComparison.Ordinal);
                return File.ReadLines(file).Select(line => (line, isMediatRFile));
            })
            .Select(t => (Match: TypeDeclarationPattern.Match(t.line), t.isMediatRFile))
            .Where(t => t.Match.Success)
            .Select(t => (Name: t.Match.Groups[1].Value, t.isMediatRFile))
            .Where(t => RestrictedApiSuffixes.Any(suffix => t.Name.EndsWith(suffix, StringComparison.Ordinal)))
            .Where(t => t.Name.EndsWith("Handler", StringComparison.Ordinal) ? t.isMediatRFile : true)
            .Select(t => t.Name)
            .Where(name => !RestrictedApiTypeAllowList.Contains(name))
            .ToArray();

        Assert.Empty(violations);
    }

    [Fact]
    public void Seeder_registration_is_centralized_through_infrastructure_extension()
    {
        var root = FindRepoRoot();
        var program = File.ReadAllText(Path.Combine(root, "backend", "src", "TheUpperRoom.Api", "Program.cs"));

        Assert.DoesNotContain("AddScoped<IDataSeeder", program, StringComparison.Ordinal);
        Assert.Contains(".AddSeeders(", program, StringComparison.Ordinal);

        var services = new ServiceCollection();
        TheUpperRoom.Infrastructure.DependencyInjection.AddSeeders(services, typeof(Program).Assembly);
        TheUpperRoom.Infrastructure.DependencyInjection.AddSeeders(
            services,
            typeof(TheUpperRoom.Infrastructure.DependencyInjection).Assembly);

        var seederNames = services
            .Where(descriptor => descriptor.ServiceType == typeof(IDataSeeder))
            .Select(descriptor => descriptor.ImplementationType?.Name)
            .OfType<string>()
            .OrderBy(name => name, StringComparer.Ordinal)
            .ToArray();

        Assert.Equal(["CitiesDataSeeder", "ContactsDataSeeder", "UserDataSeeder"], seederNames);
        Assert.Single(services, descriptor => descriptor.ServiceType == typeof(ISeedingService));
        Assert.Single(services, descriptor =>
            descriptor.ServiceType == typeof(IHostedService)
            && descriptor.ImplementationType?.Name == "SeedingHostedService");
    }

    [Fact]
    public void Application_does_not_reference_web_or_sql_server_packages()
    {
        var references = typeof(DependencyInjection).Assembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .ToArray();

        Assert.DoesNotContain("Microsoft.EntityFrameworkCore.SqlServer", references);
        Assert.DoesNotContain(references, name => name is not null && name.StartsWith("Microsoft.AspNetCore.", StringComparison.Ordinal));
    }

    [Fact]
    public void Infrastructure_does_not_reference_api_assembly()
    {
        // Infrastructure may reference Application (to implement its
        // interfaces) and Domain (for entity types). Referencing Api
        // would invert Clean Architecture's dependency direction.
        var infraAssembly = typeof(TheUpperRoom.Infrastructure.DependencyInjection).Assembly;
        var references = infraAssembly.GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .Where(name => name is not null)
            .ToArray();

        Assert.DoesNotContain(references, name => name == "TheUpperRoom.Api");
    }

    [Fact]
    public void Application_does_not_reference_infrastructure_or_api_assemblies()
    {
        // Clean Architecture inversion: Application owns interfaces;
        // Infrastructure implements them. A Project/Package reference from
        // Application back to Infrastructure or Api would invert the
        // dependency graph.
        var appAssembly = typeof(DependencyInjection).Assembly;
        var references = appAssembly.GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .Where(name => name is not null)
            .ToArray();

        Assert.DoesNotContain(references, name => name == "TheUpperRoom.Infrastructure");
        Assert.DoesNotContain(references, name => name == "TheUpperRoom.Api");
    }

    [Fact]
    public void Domain_does_not_reference_application_infrastructure_or_api_assemblies()
    {
        // Domain is the innermost layer and must not depend on any of the
        // outer layers. Catches the accidental ProjectReference slip in
        // Domain.csproj.
        var domainAssembly = typeof(TheUpperRoom.Domain.Rbac.RoleCatalog).Assembly;
        var references = domainAssembly.GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .Where(name => name is not null)
            .ToArray();

        Assert.DoesNotContain(references, name => name == "TheUpperRoom.Application");
        Assert.DoesNotContain(references, name => name == "TheUpperRoom.Infrastructure");
        Assert.DoesNotContain(references, name => name == "TheUpperRoom.Api");
    }

    [Fact]
    public void Domain_does_not_reference_ef_aspnet_mediatr_or_validation_packages()
    {
        // Domain is the innermost layer: framework-free C#. Catch the
        // accidental `<PackageReference>` slip in the .csproj that would
        // pull EF / ASP.NET / MediatR / FluentValidation into Domain.
        var domainAssembly = typeof(TheUpperRoom.Domain.Rbac.RoleCatalog).Assembly;
        var references = domainAssembly.GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .Where(name => name is not null)
            .ToArray();

        var forbidden = new[]
        {
            "Microsoft.EntityFrameworkCore",
            "Microsoft.AspNetCore",
            "MediatR",
            "FluentValidation",
            "Microsoft.Extensions.DependencyInjection",
            "Microsoft.Extensions.Logging",
        };

        foreach (var prefix in forbidden)
        {
            Assert.DoesNotContain(references, name =>
                name!.StartsWith(prefix, StringComparison.Ordinal));
        }
    }

    [Fact]
    public void Every_infrastructure_feature_dbcontext_implements_an_application_interface()
    {
        // Every <Feature>DbContext under TheUpperRoom.Infrastructure that is
        // consumed by an Application-layer handler should implement an
        // Application-defined I<Feature>DbContext interface so handlers can
        // depend on the abstraction. The exempt contexts are consumed only
        // by Infrastructure-side services or by Api controllers directly:
        //   UsersDbContext     — used by UserDirectory + AuthUserStore in
        //                        Infrastructure.
        //   CitiesDbContext    — read directly by Api/CitiesController.
        //   LocationsDbContext — read directly by Api/LocationsController.
        // None of those have a handler that needs the seam.
        var infraAssembly = typeof(TheUpperRoom.Infrastructure.DependencyInjection).Assembly;
        var appAssembly = typeof(DependencyInjection).Assembly;

        var appInterfaces = appAssembly.GetTypes()
            .Where(t => t.IsInterface && t.Name.EndsWith("DbContext", StringComparison.Ordinal))
            .ToHashSet();

        var allowed = new HashSet<string>(StringComparer.Ordinal)
        {
            "UsersDbContext",
            "CitiesDbContext",
            "LocationsDbContext",
        };

        var violations = infraAssembly.GetTypes()
            .Where(t => t is { IsClass: true, IsAbstract: false }
                && t.Name.EndsWith("DbContext", StringComparison.Ordinal)
                && !allowed.Contains(t.Name))
            .Where(t => !t.GetInterfaces().Any(i => appInterfaces.Contains(i)))
            .Select(t => t.FullName)
            .ToArray();

        Assert.Empty(violations);
    }

    [Fact]
    public void Every_application_command_or_query_is_a_public_sealed_record()
    {
        // Project convention: MediatR request types (IRequest<T>) are
        // sealed records. Records give value-equality + concise
        // definition; sealed because there's no inheritance use case.
        // Catches a regression where someone defines a class or forgets
        // `sealed`.
        var appAssembly = typeof(DependencyInjection).Assembly;
        var iRequestOpen = typeof(MediatR.IRequest<>);
        var iRequestUnit = typeof(MediatR.IRequest);

        var requests = appAssembly.GetTypes()
            .Where(t => t is { IsClass: true, IsAbstract: false })
            .Where(t => t.GetInterfaces().Any(i =>
                i == iRequestUnit ||
                (i.IsGenericType && i.GetGenericTypeDefinition() == iRequestOpen)))
            .ToArray();

        Assert.NotEmpty(requests);

        const System.Reflection.BindingFlags allInstance =
            System.Reflection.BindingFlags.Instance |
            System.Reflection.BindingFlags.Public |
            System.Reflection.BindingFlags.NonPublic;

        var violations = requests
            .Where(t => !t.IsPublic
                || !t.IsSealed
                // Records emit a synthesised <Clone>$ method; classes do not.
                || t.GetMethod("<Clone>$", allInstance) is null)
            .Select(t => $"{t.FullName} (IsPublic={t.IsPublic}, IsSealed={t.IsSealed})")
            .ToArray();

        Assert.Empty(violations);
    }

    [Fact]
    public void Every_application_handler_is_internal_sealed()
    {
        // Project convention: MediatR handlers are internal sealed. Internal
        // because nothing outside the Application assembly should construct
        // them (the controllers send requests through IMediator, never
        // newing up a handler). Sealed because there's no inheritance use
        // case — locks the convention.
        var appAssembly = typeof(DependencyInjection).Assembly;
        var requestHandler = typeof(MediatR.IRequestHandler<,>);

        var handlers = appAssembly.GetTypes()
            .Where(t => t.Name.EndsWith("Handler", StringComparison.Ordinal))
            .Where(t => t is { IsClass: true, IsAbstract: false })
            .Where(t => t.GetInterfaces()
                .Any(i => i.IsGenericType && i.GetGenericTypeDefinition() == requestHandler))
            .ToArray();

        // Sanity: there should be a meaningful number of handlers.
        Assert.NotEmpty(handlers);

        var violations = handlers
            .Where(t => t.IsPublic || !t.IsSealed)
            .Select(t => $"{t.FullName} (IsPublic={t.IsPublic}, IsSealed={t.IsSealed})")
            .ToArray();

        Assert.Empty(violations);
    }

    [Fact]
    public void Every_application_validator_is_public_sealed_and_extends_abstract_validator()
    {
        // FluentValidation's AddValidatorsFromAssembly only registers public
        // AbstractValidator<T> implementations; `sealed` is the project
        // convention for handlers/validators. Catch a regression where a
        // validator is internal (so DI silently doesn't register it) or
        // non-sealed.
        var appAssembly = typeof(DependencyInjection).Assembly;
        var abstractValidator = typeof(FluentValidation.AbstractValidator<>);

        var validators = appAssembly.GetTypes()
            .Where(t => t.Name.EndsWith("Validator", StringComparison.Ordinal))
            .Where(t => t is { IsClass: true, IsAbstract: false })
            .Where(t => InheritsFromOpenGeneric(t, abstractValidator))
            .ToArray();

        // Sanity: there should be a meaningful number of validators wired up.
        Assert.NotEmpty(validators);

        var violations = validators
            .Where(t => !t.IsPublic || !t.IsSealed)
            .Select(t => t.FullName)
            .ToArray();

        Assert.Empty(violations);

        static bool InheritsFromOpenGeneric(Type type, Type openGeneric)
        {
            for (var t = type.BaseType; t is not null; t = t.BaseType)
            {
                if (t.IsGenericType && t.GetGenericTypeDefinition() == openGeneric) return true;
            }
            return false;
        }
    }

    [Fact]
    public void Application_handlers_that_need_a_db_context_use_iappdbcontext()
    {
        var root = FindRepoRoot();
        var appRoot = Path.Combine(root, "backend", "src", "TheUpperRoom.Application");
        var dbContextInterface = new Regex(@"\bI[A-Z][A-Za-z0-9]*DbContext\b", RegexOptions.Compiled);
        var violations = Directory.GetFiles(appRoot, "*Handler.cs", SearchOption.AllDirectories)
            .Where(file => !IsBuildArtifact(file))
            .Where(file =>
            {
                var content = File.ReadAllText(file);
                if (!content.Contains("DbContext", StringComparison.Ordinal)) return false;
                // Handler must depend on an I*DbContext abstraction, not a concrete EF context.
                return !dbContextInterface.IsMatch(content);
            })
            .Select(file => NormalizePath(root, file))
            .ToArray();

        Assert.Empty(violations);
    }

    private static bool IsBuildArtifact(string file) =>
        file.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase)
        || file.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase);

    private static string NormalizePath(string root, string file) =>
        Path.GetRelativePath(root, file).Replace('\\', '/');

    private static string FindRepoRoot()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir != null && !Directory.Exists(Path.Combine(dir.FullName, ".git")))
        {
            dir = dir.Parent;
        }

        return dir?.FullName ?? AppContext.BaseDirectory;
    }
}
