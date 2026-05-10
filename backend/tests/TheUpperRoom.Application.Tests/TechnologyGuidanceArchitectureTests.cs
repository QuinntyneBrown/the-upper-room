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

    private static readonly HashSet<string> MultiTypeFileAllowList = new(StringComparer.OrdinalIgnoreCase)
    {
        "backend/src/TheUpperRoom.Api/Audit/AuditStore.cs",
        "backend/src/TheUpperRoom.Api/Audit/ListAuditEntriesQuery.cs",
        "backend/src/TheUpperRoom.Api/Auth/AuthController.cs",
        "backend/src/TheUpperRoom.Api/Cities/CitiesDbContext.cs",
        "backend/src/TheUpperRoom.Api/Contacts/ContactsController.cs",
        "backend/src/TheUpperRoom.Api/Contacts/ContactsCqrs.cs",
        "backend/src/TheUpperRoom.Api/Contacts/ContactsDbContext.cs",
        "backend/src/TheUpperRoom.Api/Dashboard/GetDashboardQuery.cs",
        "backend/src/TheUpperRoom.Api/Events/CancelEventCommand.cs",
        "backend/src/TheUpperRoom.Api/Events/EventCancelController.cs",
        "backend/src/TheUpperRoom.Api/Events/EventDto.cs",
        "backend/src/TheUpperRoom.Api/Events/EventRsvpController.cs",
        "backend/src/TheUpperRoom.Api/Events/EventRsvpCqrs.cs",
        "backend/src/TheUpperRoom.Api/Events/EventsController.cs",
        "backend/src/TheUpperRoom.Api/Events/EventsDbContext.cs",
        "backend/src/TheUpperRoom.Api/Ideas/IdeaDto.cs",
        "backend/src/TheUpperRoom.Api/Ideas/IdeasController.cs",
        "backend/src/TheUpperRoom.Api/Ideas/IdeasDbContext.cs",
        "backend/src/TheUpperRoom.Api/Kanban/BoardDetailDto.cs",
        "backend/src/TheUpperRoom.Api/Kanban/BoardsController.cs",
        "backend/src/TheUpperRoom.Api/Kanban/CardsController.cs",
        "backend/src/TheUpperRoom.Api/Kanban/KanbanDbContext.cs",
        "backend/src/TheUpperRoom.Api/Kanban/PatchCardCommand.cs",
        "backend/src/TheUpperRoom.Api/Locations/LocationsController.cs",
        "backend/src/TheUpperRoom.Api/Locations/LocationsDbContext.cs",
        "backend/src/TheUpperRoom.Api/Notes/NoteDto.cs",
        "backend/src/TheUpperRoom.Api/Notes/NotesCqrs.cs",
        "backend/src/TheUpperRoom.Api/Notes/NotesDbContext.cs",
        "backend/src/TheUpperRoom.Api/Notifications/NotificationsController.cs",
        "backend/src/TheUpperRoom.Api/Notifications/NotificationsCqrs.cs",
        "backend/src/TheUpperRoom.Api/Notifications/NotificationsDbContext.cs",
        "backend/src/TheUpperRoom.Api/Notifications/PushCommands.cs",
        "backend/src/TheUpperRoom.Api/Notifications/PushController.cs",
        "backend/src/TheUpperRoom.Api/Notifications/PushDbContext.cs",
        "backend/src/TheUpperRoom.Api/Partners/CreatePartnerRequest.cs",
        "backend/src/TheUpperRoom.Api/Partners/PartnerContactsController.cs",
        "backend/src/TheUpperRoom.Api/Partners/PartnerDto.cs",
        "backend/src/TheUpperRoom.Api/Rbac/GetCurrentUserQuery.cs",
        "backend/src/TheUpperRoom.Api/Sanitization/SanitizeController.cs",
        "backend/src/TheUpperRoom.Api/Search/SearchController.cs",
        "backend/src/TheUpperRoom.Api/Uploads/UploadFileCommand.cs",
        "backend/src/TheUpperRoom.Infrastructure/Users/UsersDbContext.cs",
    };

    private static readonly HashSet<string> RestrictedApiTypeAllowList = new(StringComparer.Ordinal)
    {
        "ListAuditEntriesQuery",
        "ListAuditEntriesHandler",
        "CitiesDataSeeder",
        "CitiesDbContext",
        "ListContactsQuery",
        "GetContactQuery",
        "CreateContactCommand",
        "UpdateContactCommand",
        "PatchContactCommand",
        "DeleteContactCommand",
        "ListContactsHandler",
        "GetContactHandler",
        "CreateContactHandler",
        "UpdateContactHandler",
        "PatchContactHandler",
        "DeleteContactHandler",
        "ContactsDataSeeder",
        "ContactsDbContext",
        "GetDashboardHandler",
        "GetDashboardQuery",
        "CancelEventCommand",
        "CancelEventHandler",
        "GetMyRsvpQuery",
        "SubmitRsvpCommand",
        "GetRsvpRequestsQuery",
        "ApproveRsvpCommand",
        "DenyRsvpCommand",
        "GetMyRsvpHandler",
        "SubmitRsvpHandler",
        "GetRsvpRequestsHandler",
        "ApproveRsvpHandler",
        "DenyRsvpHandler",
        "EventsDbContext",
        "ValidationExceptionHandler",
        "IdeasDbContext",
        "KanbanDbContext",
        "PatchCardCommand",
        "MoveCardCommand",
        "PatchCardHandler",
        "MoveCardHandler",
        "LocationsDbContext",
        "ListNotesQuery",
        "GetNoteQuery",
        "CreateNoteCommand",
        "UpdateNoteCommand",
        "DeleteNoteCommand",
        "ListNotesHandler",
        "GetNoteHandler",
        "CreateNoteHandler",
        "UpdateNoteHandler",
        "DeleteNoteHandler",
        "NotesDbContext",
        "ListNotificationsQuery",
        "MarkNotificationReadCommand",
        "MarkAllNotificationsReadCommand",
        "DispatchNotificationCommand",
        "ListNotificationPreferencesQuery",
        "UpsertNotificationPreferenceCommand",
        "ListNotificationsHandler",
        "MarkNotificationReadHandler",
        "MarkAllNotificationsReadHandler",
        "DispatchNotificationHandler",
        "ListNotificationPreferencesHandler",
        "UpsertNotificationPreferenceHandler",
        "NotificationsDbContext",
        "GetVapidPublicKeyQuery",
        "SubscribePushCommand",
        "UnsubscribePushCommand",
        "GetVapidPublicKeyHandler",
        "SubscribePushHandler",
        "UnsubscribePushHandler",
        "PushDbContext",
        "GetCurrentUserQuery",
        "GetCurrentUserHandler",
        "UploadFileCommand",
        "UploadFileHandler",
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
            .SelectMany(file => File.ReadLines(file).Select(line => TypeDeclarationPattern.Match(line)))
            .Where(match => match.Success)
            .Select(match => match.Groups[1].Value)
            .Where(name => RestrictedApiSuffixes.Any(suffix => name.EndsWith(suffix, StringComparison.Ordinal)))
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
        var violations = Directory.GetFiles(appRoot, "*Handler.cs", SearchOption.AllDirectories)
            .Where(file => !IsBuildArtifact(file))
            .Where(file =>
            {
                var content = File.ReadAllText(file);
                return content.Contains("DbContext", StringComparison.Ordinal)
                    && !content.Contains("IAppDbContext", StringComparison.Ordinal);
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
