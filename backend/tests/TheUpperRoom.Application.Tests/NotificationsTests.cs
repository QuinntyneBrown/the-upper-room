// traces_to: L2-062, L2-063
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TheUpperRoom.Application.Tests;

public sealed class NotificationsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public NotificationsTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Dispatch_creates_notification_for_each_recipient()
    {
        var client = _factory.CreateClient();

        var resp = await client.SendAsync(Post("/api/v1/notifications/dispatch", new
        {
            code = "event_reminder_24h",
            recipientIds = new[] { "admin", "guest" },
            data = new { title = "Sunday Service", time = "10:00 AM" },
        }));
        Assert.Equal(HttpStatusCode.NoContent, resp.StatusCode);

        var adminNotifs = await FetchNotifications(client, "admin");
        Assert.Contains(adminNotifs.Items, n =>
            n.Code == "event_reminder_24h" && n.Body.Contains("Sunday Service"));

        var guestNotifs = await FetchNotifications(client, "guest");
        Assert.Contains(guestNotifs.Items, n => n.Code == "event_reminder_24h");
    }

    [Fact]
    public async Task User_with_inapp_false_does_not_receive_notification()
    {
        var client = _factory.CreateClient();

        var prefResp = await client.SendAsync(Put("/api/v1/notifications/preferences", new
        {
            code = "event_reminder_24h",
            inApp = false,
            email = false,
            push = false,
        }, "lead"));
        Assert.Equal(HttpStatusCode.OK, prefResp.StatusCode);

        var dispatchResp = await client.SendAsync(Post("/api/v1/notifications/dispatch", new
        {
            code = "event_reminder_24h",
            recipientIds = new[] { "lead" },
            data = new { title = "Sunday Service", time = "10:00 AM" },
        }));
        Assert.Equal(HttpStatusCode.NoContent, dispatchResp.StatusCode);

        var notifs = await FetchNotifications(client, "lead");
        Assert.Empty(notifs.Items);
    }

    [Fact]
    public async Task Each_notification_has_code_data_read_false_and_createdAt()
    {
        var client = _factory.CreateClient();

        await client.SendAsync(Post("/api/v1/notifications/dispatch", new
        {
            code = "event_reminder_24h",
            recipientIds = new[] { "member" },
            data = new { title = "Sunday Service", time = "10:00 AM" },
        }));

        var notifs = await FetchNotifications(client, "member");
        Assert.NotEmpty(notifs.Items);

        var n = notifs.Items[0];
        Assert.NotEmpty(n.Code);
        Assert.NotNull(n.Data);
        Assert.False(n.Read);
        Assert.NotEqual(default, n.CreatedAt);
    }

    private async Task<NotificationsEnvelope> FetchNotifications(HttpClient client, string userId)
    {
        var resp = await client.SendAsync(Get("/api/v1/notifications", userId));
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var envelope = await resp.Content.ReadFromJsonAsync<NotificationsEnvelope>();
        return envelope!;
    }

    private static HttpRequestMessage Post(string path, object body, string userId = "lead")
    {
        var req = new HttpRequestMessage(HttpMethod.Post, path) { Content = JsonContent.Create(body) };
        req.Headers.Add("X-Test-User-Id", userId);
        return req;
    }

    private static HttpRequestMessage Put(string path, object body, string userId = "lead")
    {
        var req = new HttpRequestMessage(HttpMethod.Put, path) { Content = JsonContent.Create(body) };
        req.Headers.Add("X-Test-User-Id", userId);
        return req;
    }

    private static HttpRequestMessage Get(string path, string userId = "lead")
    {
        var req = new HttpRequestMessage(HttpMethod.Get, path);
        req.Headers.Add("X-Test-User-Id", userId);
        return req;
    }

    private sealed record NotificationDto(
        string Id,
        string Code,
        string Title,
        string Body,
        Dictionary<string, string>? Data,
        bool Read,
        DateTimeOffset CreatedAt);

    private sealed record NotificationsEnvelope(NotificationDto[] Items, int Total);
}
