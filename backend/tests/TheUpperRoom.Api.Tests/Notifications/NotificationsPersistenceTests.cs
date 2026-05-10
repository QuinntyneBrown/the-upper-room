// Traces to: TASK-0229
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
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

namespace TheUpperRoom.Api.Tests.Notifications;

public sealed class NotificationsPersistenceTests : IDisposable
{
    private readonly Dictionary<Type, string> _paths = new();

    public NotificationsPersistenceTests()
    {
        foreach (var t in new[]
        {
            typeof(NotificationsDbContext), typeof(NotesDbContext), typeof(IdeasDbContext),
            typeof(EventsDbContext), typeof(ContactsDbContext), typeof(LocationsDbContext),
            typeof(KanbanDbContext), typeof(PushDbContext),
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

    private WebApplicationFactory<Program> Factory() =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(b =>
            b.ConfigureTestServices(services =>
            {
                Replace<NotificationsDbContext>(services, _paths[typeof(NotificationsDbContext)]);
                Replace<NotesDbContext>(services, _paths[typeof(NotesDbContext)]);
                Replace<IdeasDbContext>(services, _paths[typeof(IdeasDbContext)]);
                Replace<EventsDbContext>(services, _paths[typeof(EventsDbContext)]);
                Replace<ContactsDbContext>(services, _paths[typeof(ContactsDbContext)]);
                Replace<LocationsDbContext>(services, _paths[typeof(LocationsDbContext)]);
                Replace<KanbanDbContext>(services, _paths[typeof(KanbanDbContext)]);
                Replace<PushDbContext>(services, _paths[typeof(PushDbContext)]);
            }));

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

    private sealed record DispatchBody(string Code, string[] RecipientIds, Dictionary<string, string>? Data);

    private static async Task Dispatch(HttpClient client, string code, string[] recipients, Dictionary<string, string>? data = null)
    {
        var resp = await client.PostAsJsonAsync("/api/v1/notifications/dispatch", new DispatchBody(code, recipients, data));
        Assert.Equal(HttpStatusCode.NoContent, resp.StatusCode);
    }

    [Fact]
    public async Task Notifications_persist_across_host_restart()
    {
        await using (var factory1 = Factory())
        {
            await Dispatch(AuthedClient(factory1, "lead"), "welcome", new[] { "admin" });
        }

        await using var factory2 = Factory();
        var resp = await AuthedClient(factory2, "admin").GetAsync("/api/v1/notifications");
        var json = await resp.Content.ReadAsStringAsync();
        Assert.True(resp.IsSuccessStatusCode, $"Status: {resp.StatusCode}, body: {json}");
        Assert.Contains("welcome", json);
    }

    [Fact]
    public async Task Preferences_persist_across_host_restart()
    {
        await using (var factory1 = Factory())
        {
            var put = await AuthedClient(factory1, "lead").PutAsJsonAsync(
                "/api/v1/notifications/preferences",
                new { code = "welcome", inApp = false, email = false, push = false });
            Assert.Equal(HttpStatusCode.OK, put.StatusCode);
        }

        await using var factory2 = Factory();
        var resp = await AuthedClient(factory2, "lead").GetAsync("/api/v1/notifications/preferences");
        var json = await resp.Content.ReadAsStringAsync();
        Assert.Contains("\"code\":\"welcome\",\"inApp\":false,\"email\":false,\"push\":false", json);
    }

    [Fact]
    public async Task Sent_mail_persists_across_host_restart()
    {
        await using (var factory1 = Factory())
        {
            await Dispatch(AuthedClient(factory1, "lead"), "welcome", new[] { "admin" });
        }

        await using var factory2 = Factory();
        using var scope = factory2.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NotificationsDbContext>();
        Assert.Contains(db.SentMail.ToList(), m => m.ToUserId == "admin");
    }

    [Fact]
    public async Task Digest_default_is_off_then_put_persists_across_restart()
    {
        await using (var factory1 = Factory())
        {
            var initial = await AuthedClient(factory1, "lead").GetAsync("/api/v1/notifications/digest");
            Assert.Equal(HttpStatusCode.OK, initial.StatusCode);
            var initialJson = await initial.Content.ReadAsStringAsync();
            Assert.Contains("\"digestFrequency\":\"off\"", initialJson);

            var put = await AuthedClient(factory1, "lead").PutAsJsonAsync(
                "/api/v1/notifications/digest",
                new { digestFrequency = "weekly" });
            Assert.Equal(HttpStatusCode.OK, put.StatusCode);
        }

        await using var factory2 = Factory();
        var resp = await AuthedClient(factory2, "lead").GetAsync("/api/v1/notifications/digest");
        var json = await resp.Content.ReadAsStringAsync();
        Assert.Contains("\"digestFrequency\":\"weekly\"", json);
    }

    [Fact]
    public async Task Digest_invalid_frequency_returns_422()
    {
        await using var factory = Factory();
        var resp = await AuthedClient(factory, "lead").PutAsJsonAsync(
            "/api/v1/notifications/digest",
            new { digestFrequency = "yearly" });
        Assert.Equal(HttpStatusCode.UnprocessableEntity, resp.StatusCode);
    }
}
