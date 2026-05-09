// traces_to: L2-063
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Rbac;

namespace TheUpperRoom.Api.Notifications;

[ApiController]
[Route("api/v1/push")]
public sealed class PushController : ControllerBase
{
    private sealed class PushSubscriptionRecord
    {
        public string UserId { get; init; } = "";
        public string Endpoint { get; init; } = "";
        public string P256dh { get; init; } = "";
        public string Auth { get; init; } = "";
    }

    internal static readonly List<PushSubscriptionRecord> Subscriptions = [];
    internal static readonly List<PendingPush> PendingPushes = [];

    [HttpGet("vapid-public-key")]
    public IActionResult VapidPublicKey() =>
        Ok("BFakeVapidPublicKey123ForTesting");

    [HttpPost("subscribe")]
    public IActionResult Subscribe([FromBody] PushSubscribeRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();
        if (body is null) return BadRequest();

        Subscriptions.RemoveAll(s => s.UserId == user.Id);
        Subscriptions.Add(new PushSubscriptionRecord
        {
            UserId = user.Id,
            Endpoint = body.Endpoint,
            P256dh = body.Keys?.P256dh ?? "",
            Auth = body.Keys?.Auth ?? "",
        });
        return NoContent();
    }

    [HttpDelete("subscribe")]
    public IActionResult Unsubscribe()
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();
        Subscriptions.RemoveAll(s => s.UserId == user.Id);
        return NoContent();
    }

    [HttpGet("test/pending")]
    public IActionResult TestPending([FromQuery] string? userId)
    {
        var items = PendingPushes
            .Where(p => userId == null || p.UserId == userId)
            .Select(p => new { p.Title, p.Body })
            .ToList();
        return Ok(items);
    }

    internal static void EnqueuePush(string userId, string title, string body)
    {
        if (Subscriptions.Any(s => s.UserId == userId))
            PendingPushes.Add(new PendingPush(userId, title, body));
    }

    private SeedUser? GetCurrentUser()
    {
        var userId = Request.Headers["X-Test-User-Id"].ToString();
        return string.IsNullOrEmpty(userId) || !SeedUsers.ById.TryGetValue(userId, out var user) ? null : user;
    }
}

internal sealed record PendingPush(string UserId, string Title, string Body);
public sealed record PushSubscribeRequest(string Endpoint, PushKeys? Keys);
public sealed record PushKeys(string P256dh, string Auth);
