// Traces to: TASK-0230
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
using TheUpperRoom.Application.Notifications;
using TheUpperRoom.Infrastructure.Contacts;
using TheUpperRoom.Infrastructure.Events;
using TheUpperRoom.Infrastructure.Ideas;
using TheUpperRoom.Infrastructure.Kanban;
using TheUpperRoom.Infrastructure.Locations;
using TheUpperRoom.Infrastructure.Notes;
using TheUpperRoom.Infrastructure.Notifications;

namespace TheUpperRoom.Api.Tests.Notifications;

public sealed class PushPersistenceTests : IDisposable
{
    private readonly Dictionary<Type, string> _paths = new();

    public PushPersistenceTests()
    {
        foreach (var t in new[]
        {
            typeof(PushDbContext), typeof(NotificationsDbContext), typeof(NotesDbContext),
            typeof(IdeasDbContext), typeof(EventsDbContext), typeof(ContactsDbContext),
            typeof(LocationsDbContext), typeof(KanbanDbContext),
        })
        {
            _paths[t] = Path.Combine(Path.GetTempPath(), $"tar-{t.Name}-{Guid.NewGuid():N}.db");
        }
    }

    public void Dispose()
    {
        Microsoft.Data.Sqlite.SqliteConnection.ClearAllPools();
        foreach (var p in _paths.Values)
        {
            try { if (File.Exists(p)) File.Delete(p); }
            catch { /* OS will reclaim */ }
        }
    }

    private WebApplicationFactory<Program> Factory(string? vapidPublicKey = "BVapidConfiguredKeyXyzAbc") =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(b =>
        {
            b.ConfigureTestServices(services =>
            {
                Replace<PushDbContext>(services, _paths[typeof(PushDbContext)]);
                Replace<NotificationsDbContext>(services, _paths[typeof(NotificationsDbContext)]);
                Replace<NotesDbContext>(services, _paths[typeof(NotesDbContext)]);
                Replace<IdeasDbContext>(services, _paths[typeof(IdeasDbContext)]);
                Replace<EventsDbContext>(services, _paths[typeof(EventsDbContext)]);
                Replace<ContactsDbContext>(services, _paths[typeof(ContactsDbContext)]);
                Replace<LocationsDbContext>(services, _paths[typeof(LocationsDbContext)]);
                Replace<KanbanDbContext>(services, _paths[typeof(KanbanDbContext)]);

                if (vapidPublicKey is not null)
                {
                    var pushSettingsDescriptor = services.Single(s => s.ServiceType == typeof(PushSettings));
                    services.Remove(pushSettingsDescriptor);
                    services.AddSingleton(new PushSettings { VapidPublicKey = vapidPublicKey });
                }
            });
        });

    private static void Replace<TContext>(IServiceCollection services, string path) where TContext : DbContext
    {
        var d = services.Single(s => s.ServiceType == typeof(DbContextOptions<TContext>));
        services.Remove(d);
        services.AddDbContext<TContext>(o => o.UseSqlite($"Data Source={path}"));
    }

    private static HttpClient AuthedClient(WebApplicationFactory<Program> factory, string userId)
    {
        var client = factory.CreateClient();
        var token = factory.Services.GetRequiredService<TheUpperRoom.Api.Auth.ITokenService>().IssueAccessToken(userId);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    [Fact]
    public async Task Push_subscriptions_persist_across_host_restart()
    {
        await using (var factory1 = Factory())
        {
            var resp = await AuthedClient(factory1, "lead").PostAsJsonAsync(
                "/api/v1/push/subscribe",
                new { endpoint = "https://push.example.com/abc", keys = new { p256dh = "p256-key", auth = "auth-key" } });
            Assert.Equal(HttpStatusCode.NoContent, resp.StatusCode);
        }

        // Subscribe a recipient on a fresh factory that points at the same files
        await using var factory2 = Factory();
        // Send a push notification through dispatch to "lead" — only fires if subscription survived
        var member = AuthedClient(factory2, "lead");
        var prefs = await member.PutAsJsonAsync(
            "/api/v1/notifications/preferences",
            new { code = "welcome", inApp = true, email = false, push = true });
        Assert.Equal(HttpStatusCode.OK, prefs.StatusCode);

        var dispatch = await AuthedClient(factory2, "admin").PostAsJsonAsync(
            "/api/v1/notifications/dispatch",
            new { code = "welcome", recipientIds = new[] { "lead" }, data = (object?)null });
        Assert.Equal(HttpStatusCode.NoContent, dispatch.StatusCode);

        using var scope = factory2.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<PushDbContext>();
        Assert.NotEmpty(db.PendingPushes.Where(p => p.UserId == "lead").ToList()); // subscription survived
    }

    [Fact]
    public async Task Pending_pushes_persist_across_host_restart()
    {
        await using (var factory1 = Factory())
        {
            var sub = await AuthedClient(factory1, "lead").PostAsJsonAsync(
                "/api/v1/push/subscribe",
                new { endpoint = "https://push.example.com/abc", keys = new { p256dh = "p", auth = "a" } });
            Assert.Equal(HttpStatusCode.NoContent, sub.StatusCode);
            var prefs = await AuthedClient(factory1, "lead").PutAsJsonAsync(
                "/api/v1/notifications/preferences",
                new { code = "welcome", inApp = true, email = false, push = true });
            Assert.Equal(HttpStatusCode.OK, prefs.StatusCode);
            var dispatch = await AuthedClient(factory1, "admin").PostAsJsonAsync(
                "/api/v1/notifications/dispatch",
                new { code = "welcome", recipientIds = new[] { "lead" }, data = (object?)null });
            Assert.Equal(HttpStatusCode.NoContent, dispatch.StatusCode);
        }

        await using var factory2 = Factory();
        using var scope = factory2.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<PushDbContext>();
        Assert.NotEmpty(db.PendingPushes.Where(p => p.UserId == "lead").ToList());
    }

    [Fact]
    public async Task Vapid_public_key_endpoint_returns_configured_value()
    {
        await using var factory = Factory(vapidPublicKey: "BConfiguredVapidKeyForTesting123");
        var resp = await AuthedClient(factory, "lead").GetAsync("/api/v1/push/vapid-public-key");
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadAsStringAsync();
        Assert.Contains("BConfiguredVapidKeyForTesting123", body);
    }

    [Fact]
    public async Task Vapid_public_key_endpoint_does_not_return_legacy_literal()
    {
        await using var factory = Factory();
        var resp = await AuthedClient(factory, "lead").GetAsync("/api/v1/push/vapid-public-key");
        var body = await resp.Content.ReadAsStringAsync();
        Assert.DoesNotContain("BFakeVapidPublicKey123ForTesting", body);
    }
}
