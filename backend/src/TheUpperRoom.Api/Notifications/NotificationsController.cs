// traces_to: L2-062, L2-063
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Rbac;
using TheUpperRoom.Domain.Notifications;

namespace TheUpperRoom.Api.Notifications;

[ApiController]
[Authorize]
[Route("api/v1/notifications")]
public sealed class NotificationsController(NotificationsDbContext db, MailStore mail, PushDispatcher push) : ControllerBase
{
    [HttpGet]
    public IActionResult List()
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var items = db.Notifications
            .Where(n => n.UserId == user.Id)
            .AsEnumerable()
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

        var n = db.Notifications.FirstOrDefault(x => x.Id == id && x.UserId == user.Id);
        if (n is null) return NotFound();

        n.Read = true;
        db.SaveChanges();
        return Ok(ToDto(n));
    }

    [HttpPost("read-all")]
    public IActionResult MarkAllRead()
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        foreach (var n in db.Notifications.Where(x => x.UserId == user.Id && !x.Read))
            n.Read = true;
        db.SaveChanges();

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

        var data = body.Data ?? new();

        foreach (var recipientId in body.RecipientIds)
        {
            var pref = db.Preferences.Find(recipientId, body.Code);
            var subject = Render(type.Title, data);
            var bodyText = Render(type.BodyTemplate, data);

            if (pref is null || pref.InApp)
            {
                db.Notifications.Add(new NotificationRow
                {
                    UserId = recipientId,
                    Code = body.Code,
                    Title = subject,
                    Body = bodyText,
                    Data = data,
                    Read = false,
                    CreatedAt = DateTimeOffset.UtcNow,
                    Severity = type.Severity.ToString(),
                });
            }

            if (pref is null || pref.Email)
            {
                mail.Send(recipientId, subject, bodyText);
            }

            if (pref?.Push == true)
            {
                push.Enqueue(recipientId, subject, bodyText);
            }
        }

        db.SaveChanges();
        return NoContent();
    }

    [HttpGet("preferences")]
    public IActionResult ListPreferences()
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var stored = db.Preferences.Where(p => p.UserId == user.Id).ToList();
        var result = NotificationCatalog.All.Select(t =>
        {
            var s = stored.FirstOrDefault(p => p.Code == t.Code);
            return new
            {
                code = t.Code,
                inApp = s?.InApp ?? true,
                email = s?.Email ?? true,
                push = s?.Push ?? false,
            };
        }).ToList();

        return Ok(result);
    }

    [HttpPut("preferences")]
    public IActionResult UpsertPreference([FromBody] UpsertPreferenceRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();
        if (body is null) return BadRequest();

        var existing = db.Preferences.Find(user.Id, body.Code);
        if (existing is not null)
        {
            existing.InApp = body.InApp;
            existing.Email = body.Email;
            existing.Push = body.Push;
        }
        else
        {
            db.Preferences.Add(new PreferenceRow
            {
                UserId = user.Id,
                Code = body.Code,
                InApp = body.InApp,
                Email = body.Email,
                Push = body.Push,
            });
        }
        db.SaveChanges();

        return Ok(new { userId = user.Id, code = body.Code, inApp = body.InApp, email = body.Email, push = body.Push });
    }

    private static string Render(string template, Dictionary<string, string> data) =>
        data.Aggregate(template, (t, kv) => t.Replace("{" + kv.Key + "}", kv.Value));

    private static NotificationDto ToDto(NotificationRow n) =>
        new(n.Id, n.Code, n.Title, n.Body, n.Data, n.Read, n.CreatedAt, n.DeepLink, n.Severity);

    private SeedUser? GetCurrentUser()
    {
        var userId = User.FindFirst("sub")?.Value ?? "";
        return string.IsNullOrEmpty(userId) || !SeedUsers.ById.TryGetValue(userId, out var user) ? null : user;
    }
}

public sealed record DispatchRequest(string Code, string[] RecipientIds, Dictionary<string, string>? Data);
public sealed record UpsertPreferenceRequest(string Code, bool InApp, bool Email, bool Push);
