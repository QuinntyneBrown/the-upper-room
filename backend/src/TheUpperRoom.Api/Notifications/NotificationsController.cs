// traces_to: L2-062, L2-063
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Rbac;
using TheUpperRoom.Domain.Notifications;

namespace TheUpperRoom.Api.Notifications;

[ApiController]
[Route("api/v1/notifications")]
public sealed class NotificationsController : ControllerBase
{
    private sealed class NotificationRecord
    {
        public string Id { get; } = Guid.NewGuid().ToString();
        public string UserId { get; init; } = "";
        public string Code { get; init; } = "";
        public string Title { get; init; } = "";
        public string Body { get; init; } = "";
        public Dictionary<string, string> Data { get; init; } = [];
        public bool Read { get; set; }
        public DateTimeOffset CreatedAt { get; init; }
        public string? DeepLink { get; init; }
        public string Severity { get; init; } = "Info";
    }

    private sealed class PreferenceRecord
    {
        public string UserId { get; init; } = "";
        public string Code { get; init; } = "";
        public bool InApp { get; set; } = true;
        public bool Email { get; set; } = true;
        public bool Push { get; set; }
    }

    private static readonly List<NotificationRecord> _store = [];
    private static readonly List<PreferenceRecord> _preferences = [];

    [HttpGet]
    public IActionResult List()
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var items = _store
            .Where(n => n.UserId == user.Id)
            .OrderByDescending(n => n.CreatedAt)
            .Select(ToDto)
            .ToList();

        return Ok(new { items, total = items.Count });
    }

    [HttpPost("{id}/read")]
    public IActionResult MarkRead(string id)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var n = _store.FirstOrDefault(x => x.Id == id && x.UserId == user.Id);
        if (n is null) return NotFound();

        n.Read = true;
        return Ok(ToDto(n));
    }

    [HttpPost("read-all")]
    public IActionResult MarkAllRead()
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        foreach (var n in _store.Where(x => x.UserId == user.Id && !x.Read))
            n.Read = true;

        return NoContent();
    }

    [HttpPost("dispatch")]
    public IActionResult Dispatch([FromBody] DispatchRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();
        if (body is null) return BadRequest();

        var type = NotificationCatalog.All.FirstOrDefault(t => t.Code == body.Code);
        if (type is null) return UnprocessableEntity(new { error = $"Unknown notification code '{body.Code}'." });

        var data = body.Data ?? [];

        foreach (var recipientId in body.RecipientIds)
        {
            var pref = _preferences.FirstOrDefault(p => p.UserId == recipientId && p.Code == body.Code);
            if (pref is not null && !pref.InApp) continue;

            _store.Add(new NotificationRecord
            {
                UserId = recipientId,
                Code = body.Code,
                Title = Render(type.Title, data),
                Body = Render(type.BodyTemplate, data),
                Data = data,
                Read = false,
                CreatedAt = DateTimeOffset.UtcNow,
                Severity = type.Severity.ToString(),
            });
        }

        return NoContent();
    }

    [HttpPut("preferences")]
    public IActionResult UpsertPreference([FromBody] UpsertPreferenceRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();
        if (body is null) return BadRequest();

        var existing = _preferences.FirstOrDefault(p => p.UserId == user.Id && p.Code == body.Code);
        if (existing is not null)
        {
            existing.InApp = body.InApp;
            existing.Email = body.Email;
            existing.Push = body.Push;
        }
        else
        {
            _preferences.Add(new PreferenceRecord
            {
                UserId = user.Id,
                Code = body.Code,
                InApp = body.InApp,
                Email = body.Email,
                Push = body.Push,
            });
        }

        return Ok(new { userId = user.Id, code = body.Code, inApp = body.InApp, email = body.Email, push = body.Push });
    }

    private static string Render(string template, Dictionary<string, string> data) =>
        data.Aggregate(template, (t, kv) => t.Replace("{" + kv.Key + "}", kv.Value));

    private static NotificationDto ToDto(NotificationRecord n) =>
        new(n.Id, n.Code, n.Title, n.Body, n.Data, n.Read, n.CreatedAt, n.DeepLink, n.Severity);

    private SeedUser? GetCurrentUser()
    {
        var userId = Request.Headers["X-Test-User-Id"].ToString();
        return string.IsNullOrEmpty(userId) || !SeedUsers.ById.TryGetValue(userId, out var user) ? null : user;
    }
}

public sealed record DispatchRequest(string Code, string[] RecipientIds, Dictionary<string, string>? Data);
public sealed record UpsertPreferenceRequest(string Code, bool InApp, bool Email, bool Push);
