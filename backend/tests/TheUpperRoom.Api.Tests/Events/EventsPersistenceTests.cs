// Traces to: TASK-0224
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace TheUpperRoom.Api.Tests.Events;

public sealed class EventsPersistenceTests : IDisposable
{
    private readonly string _eventsDbPath;
    private readonly string _contactsDbPath;

    public EventsPersistenceTests()
    {
        _eventsDbPath = Path.Combine(Path.GetTempPath(), $"tar-events-{Guid.NewGuid():N}.db");
        _contactsDbPath = Path.Combine(Path.GetTempPath(), $"tar-contacts-{Guid.NewGuid():N}.db");
    }

    public void Dispose()
    {
        if (File.Exists(_eventsDbPath)) File.Delete(_eventsDbPath);
        if (File.Exists(_contactsDbPath)) File.Delete(_contactsDbPath);
    }

    private WebApplicationFactory<Program> Factory() =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(b =>
            b.ConfigureAppConfiguration((_, cfg) =>
                cfg.AddInMemoryCollection(new Dictionary<string, string?>
                {
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

    private static async Task<string> CreateEvent(HttpClient client, string title)
    {
        var resp = await client.PostAsJsonAsync(
            "/api/v1/events",
            new { title, startAt = DateTimeOffset.UtcNow.AddDays(7), endAt = DateTimeOffset.UtcNow.AddDays(7).AddHours(2) });
        Assert.Equal(HttpStatusCode.Created, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<EventDtoLite>();
        return body!.Id;
    }

    private sealed record EventDtoLite(string Id, string Title, string Status);
    private sealed record ListResponse(EventDtoLite[] Items, int Total);

    [Fact]
    public async Task Created_event_persists_across_host_restart()
    {
        string id;
        await using (var factory1 = Factory())
        {
            id = await CreateEvent(AuthedClient(factory1, "lead"), "Restart-Survival Night");
        }

        await using var factory2 = Factory();
        var resp = await AuthedClient(factory2, "lead").GetAsync($"/api/v1/events/{id}");
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
    }

    [Fact]
    public async Task Legacy_e_seed_is_not_present_in_a_fresh_database()
    {
        await using var factory = Factory();
        var resp = await AuthedClient(factory, "lead").GetAsync("/api/v1/events/e-seed");
        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
    }

    [Fact]
    public async Task Rsvps_persist_across_host_restart()
    {
        string id;
        await using (var factory1 = Factory())
        {
            var client = AuthedClient(factory1, "lead");
            id = await CreateEvent(client, "RSVP Persistence");
            var rsvp = await client.PostAsJsonAsync($"/api/v1/events/{id}/rsvp", new { status = "Going" });
            Assert.Equal(HttpStatusCode.OK, rsvp.StatusCode);
        }

        await using var factory2 = Factory();
        var resp = await AuthedClient(factory2, "lead").GetAsync($"/api/v1/events/{id}/rsvp");
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadAsStringAsync();
        Assert.Contains("\"rsvpStatus\":\"Going\"", body);
    }

    [Fact]
    public async Task Capacity_waitlist_behavior_still_works()
    {
        await using var factory = Factory();
        var lead = AuthedClient(factory, "lead");
        var member = AuthedClient(factory, "member");

        var resp = await lead.PostAsJsonAsync(
            "/api/v1/events",
            new { title = "Tiny", capacity = 1, startAt = DateTimeOffset.UtcNow.AddDays(7), endAt = DateTimeOffset.UtcNow.AddDays(7).AddHours(1) });
        var ev = await resp.Content.ReadFromJsonAsync<EventDtoLite>();

        var r1 = await lead.PostAsJsonAsync($"/api/v1/events/{ev!.Id}/rsvp", new { status = "Going" });
        Assert.Contains("\"rsvpStatus\":\"Going\"", await r1.Content.ReadAsStringAsync());

        var r2 = await member.PostAsJsonAsync($"/api/v1/events/{ev.Id}/rsvp", new { status = "Going" });
        Assert.Contains("\"rsvpStatus\":\"Waitlisted\"", await r2.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Cancelled_recurring_occurrence_persists_across_restart()
    {
        string id;
        const string occurrenceDate = "2026-12-01";
        await using (var factory1 = Factory())
        {
            var client = AuthedClient(factory1, "lead");
            var resp = await client.PostAsJsonAsync(
                "/api/v1/events",
                new { title = "Recurring", startAt = DateTimeOffset.Parse("2026-12-01T18:00:00Z"), endAt = DateTimeOffset.Parse("2026-12-01T20:00:00Z"), recurrenceRule = "FREQ=WEEKLY;COUNT=4" });
            id = (await resp.Content.ReadFromJsonAsync<EventDtoLite>())!.Id;
            var cancel = await client.PostAsync($"/api/v1/events/{id}/occurrences/{occurrenceDate}/cancel", null);
            Assert.Equal(HttpStatusCode.OK, cancel.StatusCode);
        }

        await using var factory2 = Factory();
        var resp2 = await AuthedClient(factory2, "lead").GetAsync($"/api/v1/events/{id}");
        Assert.Equal(HttpStatusCode.OK, resp2.StatusCode);
        var body = await resp2.Content.ReadAsStringAsync();
        Assert.Contains(occurrenceDate, body);
    }
}
