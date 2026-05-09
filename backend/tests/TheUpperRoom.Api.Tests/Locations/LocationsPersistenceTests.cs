// Traces to: TASK-0227
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace TheUpperRoom.Api.Tests.Locations;

public sealed class LocationsPersistenceTests : IDisposable
{
    private readonly string _locationsDbPath;
    private readonly string _eventsDbPath;
    private readonly string _contactsDbPath;

    public LocationsPersistenceTests()
    {
        _locationsDbPath = Path.Combine(Path.GetTempPath(), $"tar-locations-{Guid.NewGuid():N}.db");
        _eventsDbPath = Path.Combine(Path.GetTempPath(), $"tar-events-{Guid.NewGuid():N}.db");
        _contactsDbPath = Path.Combine(Path.GetTempPath(), $"tar-contacts-{Guid.NewGuid():N}.db");
    }

    public void Dispose()
    {
        if (File.Exists(_locationsDbPath)) File.Delete(_locationsDbPath);
        if (File.Exists(_eventsDbPath)) File.Delete(_eventsDbPath);
        if (File.Exists(_contactsDbPath)) File.Delete(_contactsDbPath);
    }

    private WebApplicationFactory<Program> Factory() =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(b =>
            b.ConfigureAppConfiguration((_, cfg) =>
                cfg.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["LocationsDb:ConnectionString"] = $"Data Source={_locationsDbPath}",
                    ["EventsDb:ConnectionString"] = $"Data Source={_eventsDbPath}",
                    ["ContactsDb:ConnectionString"] = $"Data Source={_contactsDbPath}",
                })));

    private HttpClient AuthedClient(WebApplicationFactory<Program> factory, string userId)
    {
        var client = factory.CreateClient();
        var token = factory.Services.GetRequiredService<TheUpperRoom.Api.Auth.ITokenService>().IssueAccessToken(userId);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    private static async Task<string> CreateLocation(HttpClient client, string name)
    {
        var resp = await client.PostAsJsonAsync("/api/v1/locations", new { name });
        Assert.Equal(HttpStatusCode.Created, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<LocationLite>();
        return body!.Id;
    }

    private static async Task<string> CreateFutureEventAtLocation(HttpClient client, string locationId)
    {
        var resp = await client.PostAsJsonAsync("/api/v1/events", new
        {
            title = "Test Event",
            locationId,
            startAt = DateTimeOffset.UtcNow.AddDays(7),
            endAt = DateTimeOffset.UtcNow.AddDays(7).AddHours(2),
        });
        Assert.Equal(HttpStatusCode.Created, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<EventLite>();
        return body!.Id;
    }

    private sealed record LocationLite(string Id, string Name);
    private sealed record EventLite(string Id, string Title);

    [Fact]
    public async Task Created_location_survives_host_restart()
    {
        string id;
        await using (var factory1 = Factory())
        {
            id = await CreateLocation(AuthedClient(factory1, "lead"), "Community Hall");
        }

        await using var factory2 = Factory();
        var resp = await AuthedClient(factory2, "lead").GetAsync($"/api/v1/locations/{id}");
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
    }

    [Fact]
    public async Task Deleting_location_referenced_by_future_event_is_blocked()
    {
        await using var factory = Factory();
        var client = AuthedClient(factory, "lead");
        var locationId = await CreateLocation(client, "Blocked Hall");
        await CreateFutureEventAtLocation(client, locationId);

        var del = await client.DeleteAsync($"/api/v1/locations/{locationId}");
        Assert.Equal(HttpStatusCode.Conflict, del.StatusCode);
    }

    [Fact]
    public async Task Referenced_by_future_events_check_reads_from_events_table()
    {
        await using var factory = Factory();
        var client = AuthedClient(factory, "lead");
        var locationId = await CreateLocation(client, "Free Hall");

        // No future events → deletion allowed
        var del = await client.DeleteAsync($"/api/v1/locations/{locationId}");
        Assert.Equal(HttpStatusCode.NoContent, del.StatusCode);

        // Location no longer in list
        var list = await client.GetFromJsonAsync<ListResp>("/api/v1/locations");
        Assert.DoesNotContain(list!.Items, l => l.Id == locationId);
    }

    private sealed record ListResp(LocationLite[] Items, int Total);
}
