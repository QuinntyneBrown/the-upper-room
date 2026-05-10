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

    // Cross-feature aggregator that fans out to four feature DbContexts plus
    // a handful of in-process Api stores (Partners). Moving it to Application
    // would require porting every static helper it depends on; left in Api as
    // the documented exception until the partners store has its own service
    // boundary.
    private static readonly HashSet<string> RestrictedApiTypeAllowList = new(StringComparer.Ordinal)
    {
        "GetDashboardHandler",
        "GetDashboardQuery",
    };

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
