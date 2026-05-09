// traces_to: L2-063
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Rbac;

namespace TheUpperRoom.Api.Notifications;

[ApiController]
[Authorize]
[Route("api/v1/push")]
public sealed class PushController(PushDbContext db, PushSettings settings) : ControllerBase
{
    [HttpGet("vapid-public-key")]
    public IActionResult VapidPublicKey() =>
        Ok(settings.VapidPublicKey);

    [HttpPost("subscribe")]
    public IActionResult Subscribe([FromBody] PushSubscribeRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();
        if (body is null) return BadRequest();

        var existing = db.Subscriptions.Find(user.Id);
        if (existing is not null) db.Subscriptions.Remove(existing);
        db.Subscriptions.Add(new PushSubscriptionRow
        {
            UserId = user.Id,
            Endpoint = body.Endpoint,
            P256dh = body.Keys?.P256dh ?? "",
            Auth = body.Keys?.Auth ?? "",
        });
        db.SaveChanges();
        return NoContent();
    }

    [HttpDelete("subscribe")]
    public IActionResult Unsubscribe()
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();
        var existing = db.Subscriptions.Find(user.Id);
        if (existing is not null)
        {
            db.Subscriptions.Remove(existing);
            db.SaveChanges();
        }
        return NoContent();
    }

    [HttpGet("test/pending")]
    public IActionResult TestPending([FromQuery] string? userId)
    {
        var items = db.PendingPushes
            .Where(p => userId == null || p.UserId == userId)
            .Select(p => new { title = p.Title, body = p.Body })
            .ToList();
        return Ok(items);
    }

    private SeedUser? GetCurrentUser()
    {
        var userId = User.FindFirst("sub")?.Value ?? "";
        return string.IsNullOrEmpty(userId) || !SeedUsers.ById.TryGetValue(userId, out var user) ? null : user;
    }
}

public sealed record PushSubscribeRequest(string Endpoint, PushKeys? Keys);
public sealed record PushKeys(string P256dh, string Auth);
