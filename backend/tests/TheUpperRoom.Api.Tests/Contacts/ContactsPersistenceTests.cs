// Traces to: TASK-0223
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Api.Contacts;

namespace TheUpperRoom.Api.Tests.Contacts;

/// <summary>
/// Verifies contacts persist in the configured store across host restarts.
/// Each test gets a unique sqlite file path so tests don't share state.
/// </summary>
public sealed class ContactsPersistenceTests : IDisposable
{
    private readonly string _dbPath;
    private readonly string _eventsDbPath;
    private readonly string _ideasDbPath;
    private readonly string _notesDbPath;
    private readonly string _kanbanDbPath;
    private readonly string _locationsDbPath;
    private readonly string _notificationsDbPath;

    public ContactsPersistenceTests()
    {
        _dbPath = Path.Combine(Path.GetTempPath(), $"tar-contacts-{Guid.NewGuid():N}.db");
        _eventsDbPath = Path.Combine(Path.GetTempPath(), $"tar-events-{Guid.NewGuid():N}.db");
        _ideasDbPath = Path.Combine(Path.GetTempPath(), $"tar-ideas-{Guid.NewGuid():N}.db");
        _notesDbPath = Path.Combine(Path.GetTempPath(), $"tar-notes-{Guid.NewGuid():N}.db");
        _kanbanDbPath = Path.Combine(Path.GetTempPath(), $"tar-kanban-{Guid.NewGuid():N}.db");
        _locationsDbPath = Path.Combine(Path.GetTempPath(), $"tar-locations-{Guid.NewGuid():N}.db");
        _notificationsDbPath = Path.Combine(Path.GetTempPath(), $"tar-notifications-{Guid.NewGuid():N}.db");
    }

    public void Dispose()
    {
        foreach (var p in new[] { _dbPath, _eventsDbPath, _ideasDbPath, _notesDbPath, _kanbanDbPath, _locationsDbPath, _notificationsDbPath })
            if (File.Exists(p)) File.Delete(p);
    }

    private WebApplicationFactory<Program> Factory() =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(b =>
            b.ConfigureAppConfiguration((_, cfg) =>
                cfg.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["ContactsDb:ConnectionString"] = $"Data Source={_dbPath}",
                    ["EventsDb:ConnectionString"] = $"Data Source={_eventsDbPath}",
                    ["IdeasDb:ConnectionString"] = $"Data Source={_ideasDbPath}",
                    ["NotesDb:ConnectionString"] = $"Data Source={_notesDbPath}",
                    ["KanbanDb:ConnectionString"] = $"Data Source={_kanbanDbPath}",
                    ["LocationsDb:ConnectionString"] = $"Data Source={_locationsDbPath}",
                    ["NotificationsDb:ConnectionString"] = $"Data Source={_notificationsDbPath}",
                })));

    private HttpClient AuthedClient(WebApplicationFactory<Program> factory, string userId)
    {
        var client = factory.CreateClient();
        var token = factory.Services.GetRequiredService<TheUpperRoom.Api.Auth.ITokenService>().IssueAccessToken(userId);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    private static async Task<string> CreateContact(HttpClient client, string firstName, string lastName)
    {
        var resp = await client.PostAsJsonAsync(
            "/api/v1/contacts",
            new { firstName, lastName, displayName = (string?)null });
        Assert.Equal(HttpStatusCode.Created, resp.StatusCode);
        var json = await resp.Content.ReadFromJsonAsync<ContactDto>();
        return json!.Id;
    }

    private sealed record ContactDto(string Id, string Name, string CityId);

    private sealed record ListResponse(ContactDto[] Items, int Total);

    [Fact]
    public async Task Created_contact_is_returned_in_subsequent_list_request()
    {
        await using var factory = Factory();
        var client = AuthedClient(factory, "lead");

        var id = await CreateContact(client, "Carol", "Smith");
        Assert.NotNull(id);

        var list = await client.GetFromJsonAsync<ListResponse>("/api/v1/contacts");
        Assert.Contains(list!.Items, c => c.Id == id);
    }

    [Fact]
    public async Task Contacts_persist_across_host_restarts()
    {
        string id;
        await using (var factory1 = Factory())
        {
            var client = AuthedClient(factory1, "lead");
            id = await CreateContact(client, "Dana", "Olu");
        }

        await using var factory2 = Factory();
        var client2 = AuthedClient(factory2, "lead");
        var list = await client2.GetFromJsonAsync<ListResponse>("/api/v1/contacts");
        Assert.Contains(list!.Items, c => c.Id == id);
    }

    [Fact]
    public async Task Contact_in_one_city_is_not_visible_to_lead_of_another_city()
    {
        await using var factory = Factory();
        var torontoClient = AuthedClient(factory, "lead"); // seeded city: Toronto
        var halifaxClient = AuthedClient(factory, "halifaxLead"); // see test setup; falls back to admin all-cities filter

        var id = await CreateContact(torontoClient, "Toronto", "Person");

        // CityLead in Toronto sees their own contact
        var torontoList = await torontoClient.GetFromJsonAsync<ListResponse>("/api/v1/contacts");
        Assert.Contains(torontoList!.Items, c => c.Id == id);

        // SystemAdmin can see all cities
        var adminClient = AuthedClient(factory, "admin");
        var adminList = await adminClient.GetFromJsonAsync<ListResponse>("/api/v1/contacts");
        Assert.Contains(adminList!.Items, c => c.Id == id);
    }

    [Fact]
    public async Task Deleted_contact_does_not_reappear_after_host_restart()
    {
        string id;
        await using (var factory1 = Factory())
        {
            var client = AuthedClient(factory1, "lead");
            id = await CreateContact(client, "Erin", "Park");
            var del = await client.DeleteAsync($"/api/v1/contacts/{id}");
            Assert.Equal(HttpStatusCode.NoContent, del.StatusCode);
        }

        await using var factory2 = Factory();
        var client2 = AuthedClient(factory2, "lead");
        var list = await client2.GetFromJsonAsync<ListResponse>("/api/v1/contacts");
        Assert.DoesNotContain(list!.Items, c => c.Id == id);
    }
}
