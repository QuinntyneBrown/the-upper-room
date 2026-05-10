// Traces to: TASK-0226
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Api.Events;
using TheUpperRoom.Api.Ideas;
using TheUpperRoom.Api.Kanban;
using TheUpperRoom.Api.Locations;
using TheUpperRoom.Api.Notes;
using TheUpperRoom.Api.Notifications;
using TheUpperRoom.Infrastructure.Contacts;
using TheUpperRoom.Infrastructure.Events;
using TheUpperRoom.Infrastructure.Ideas;
using TheUpperRoom.Infrastructure.Kanban;
using TheUpperRoom.Infrastructure.Locations;

namespace TheUpperRoom.Api.Tests.Notes;

public sealed class NotesPersistenceTests : IDisposable
{
    private readonly string _notesDbPath;
    private readonly string _ideasDbPath;
    private readonly string _eventsDbPath;
    private readonly string _contactsDbPath;
    private readonly string _kanbanDbPath;
    private readonly string _locationsDbPath;
    private readonly string _notificationsDbPath;
    private readonly string _pushDbPath;

    public NotesPersistenceTests()
    {
        _notesDbPath = Path.Combine(Path.GetTempPath(), $"tar-notes-{Guid.NewGuid():N}.db");
        _ideasDbPath = Path.Combine(Path.GetTempPath(), $"tar-ideas-{Guid.NewGuid():N}.db");
        _eventsDbPath = Path.Combine(Path.GetTempPath(), $"tar-events-{Guid.NewGuid():N}.db");
        _contactsDbPath = Path.Combine(Path.GetTempPath(), $"tar-contacts-{Guid.NewGuid():N}.db");
        _kanbanDbPath = Path.Combine(Path.GetTempPath(), $"tar-kanban-{Guid.NewGuid():N}.db");
        _locationsDbPath = Path.Combine(Path.GetTempPath(), $"tar-locations-{Guid.NewGuid():N}.db");
        _notificationsDbPath = Path.Combine(Path.GetTempPath(), $"tar-notifications-{Guid.NewGuid():N}.db");
        _pushDbPath = Path.Combine(Path.GetTempPath(), $"tar-push-{Guid.NewGuid():N}.db");
    }

    public void Dispose()
    {
        Microsoft.Data.Sqlite.SqliteConnection.ClearAllPools();
        foreach (var p in new[] { _notesDbPath, _ideasDbPath, _eventsDbPath, _contactsDbPath, _kanbanDbPath, _locationsDbPath, _notificationsDbPath, _pushDbPath })
        {
            try { if (File.Exists(p)) File.Delete(p); }
            catch { /* OS will clean tmp files eventually */ }
        }
    }

    private WebApplicationFactory<Program> Factory() =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(b =>
            b.ConfigureTestServices(services =>
            {
                Replace<NotesDbContext>(services, $"Data Source={_notesDbPath}");
                Replace<IdeasDbContext>(services, $"Data Source={_ideasDbPath}");
                Replace<EventsDbContext>(services, $"Data Source={_eventsDbPath}");
                Replace<ContactsDbContext>(services, $"Data Source={_contactsDbPath}");
                Replace<KanbanDbContext>(services, $"Data Source={_kanbanDbPath}");
                Replace<LocationsDbContext>(services, $"Data Source={_locationsDbPath}");
                Replace<NotificationsDbContext>(services, $"Data Source={_notificationsDbPath}");
                Replace<PushDbContext>(services, $"Data Source={_pushDbPath}");
            }));

    private static void Replace<TContext>(IServiceCollection services, string connectionString) where TContext : DbContext
    {
        var d = services.Single(s => s.ServiceType == typeof(DbContextOptions<TContext>));
        services.Remove(d);
        services.AddDbContext<TContext>(o => o.UseSqlite(connectionString));
    }

    private static HttpClient AuthedClient(WebApplicationFactory<Program> factory, string userId)
    {
        var client = factory.CreateClient();
        var token = factory.Services.GetRequiredService<TheUpperRoom.Api.Auth.ITokenService>().IssueAccessToken(userId);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    private static async Task<string> CreateNote(HttpClient client, string subjectType, string subjectId, string body)
    {
        var resp = await client.PostAsJsonAsync(
            "/api/v1/notes",
            new { subjectType, subjectId, bodyMarkdown = body });
        Assert.Equal(HttpStatusCode.Created, resp.StatusCode);
        var dto = await resp.Content.ReadFromJsonAsync<NoteResponseLite>();
        return dto!.Id;
    }

    private sealed record NoteResponseLite(string Id, string SubjectType, string SubjectId, string BodyMarkdown);
    private sealed record ListResponse(NoteResponseLite[] Items, int Total);

    [Fact]
    public async Task Notes_persist_across_host_restart()
    {
        string id;
        await using (var factory1 = Factory())
        {
            id = await CreateNote(AuthedClient(factory1, "lead"), "Contact", "c1", "First note");
        }

        await using var factory2 = Factory();
        var resp = await AuthedClient(factory2, "lead").GetAsync($"/api/v1/notes/{id}");
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        Assert.Contains("First note", await resp.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Notes_are_scoped_to_subjectType_and_subjectId()
    {
        await using var factory = Factory();
        var client = AuthedClient(factory, "lead");

        await CreateNote(client, "Contact", "c1", "Note for c1");
        await CreateNote(client, "Contact", "c2", "Note for c2");
        await CreateNote(client, "Partner", "c1", "Note for partner c1");

        var c1List = await client.GetFromJsonAsync<ListResponse>("/api/v1/notes?subjectType=Contact&subjectId=c1");
        Assert.Single(c1List!.Items);
        Assert.Equal("Note for c1", c1List.Items[0].BodyMarkdown);

        var partnerList = await client.GetFromJsonAsync<ListResponse>("/api/v1/notes?subjectType=Partner&subjectId=c1");
        Assert.Single(partnerList!.Items);
        Assert.Equal("Note for partner c1", partnerList.Items[0].BodyMarkdown);
    }

    [Fact]
    public async Task Edit_history_persists_across_host_restart()
    {
        string id;
        await using (var factory1 = Factory())
        {
            var client = AuthedClient(factory1, "lead");
            id = await CreateNote(client, "Contact", "c1", "v1");
            var update = await client.PutAsJsonAsync($"/api/v1/notes/{id}", new { bodyMarkdown = "v2" });
            Assert.Equal(HttpStatusCode.OK, update.StatusCode);
        }

        await using var factory2 = Factory();
        var resp = await AuthedClient(factory2, "lead").GetAsync($"/api/v1/notes/{id}");
        var json = await resp.Content.ReadAsStringAsync();
        Assert.Contains("\"bodyMarkdown\":\"v2\"", json);
        Assert.Contains("\"bodyMarkdown\":\"v1\"", json); // appears in history
    }
}
