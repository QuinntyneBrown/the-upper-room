// traces_to: L2-052, L2-055
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Rbac;

namespace TheUpperRoom.Api.Events;

public sealed record RsvpRequest(string Status);
public sealed record RsvpResponse(string RsvpStatus, int? WaitlistPosition = null, string? PromotedUser = null);
public sealed record PendingRsvpDto(string Id, string UserId, string UserName, string RequestedAt);

[ApiController]
[Authorize]
[Route("api/v1/events/{eventId}/rsvp")]
public sealed class EventRsvpController(EventsDbContext db) : ControllerBase
{
    [HttpGet]
    public IActionResult GetMy(string eventId)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var rsvp = db.Rsvps.Find(eventId, user.Id);
        return rsvp is null
            ? Ok(new { rsvpStatus = (string?)null })
            : Ok(new { rsvpStatus = rsvp.Status, waitlistPosition = rsvp.WaitlistPosition });
    }

    [HttpPost]
    public IActionResult Submit(string eventId, [FromBody] RsvpRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();
        if (body is null) return BadRequest();

        var ev = db.Events.Find(eventId);
        if (ev is null) return NotFound();

        var existing = db.Rsvps.Find(eventId, user.Id);
        string? promotedUser = null;

        if (existing is not null)
        {
            if (existing.Status == "Going" && body.Status == "No")
            {
                var waitlisted = db.Rsvps.FirstOrDefault(r => r.EventId == eventId && r.Status == "Waitlisted");
                if (waitlisted is not null)
                {
                    waitlisted.Status = "Going";
                    waitlisted.WaitlistPosition = null;
                    promotedUser = waitlisted.UserId;
                }
            }
            db.Rsvps.Remove(existing);
        }

        if (body.Status == "No")
        {
            db.SaveChanges();
            return Ok(new RsvpResponse("Cancelled", null, promotedUser));
        }

        if (body.Status == "Maybe")
        {
            db.Rsvps.Add(new RsvpRow { EventId = eventId, UserId = user.Id, Status = "Maybe" });
            db.SaveChanges();
            return Ok(new RsvpResponse("Maybe"));
        }

        if (ev.RequiresApproval)
        {
            db.Rsvps.Add(new RsvpRow { EventId = eventId, UserId = user.Id, Status = "PendingApproval" });
            db.SaveChanges();
            return Ok(new RsvpResponse("PendingApproval"));
        }

        var goingCount = db.Rsvps.Count(r => r.EventId == eventId && r.Status == "Going");
        if (ev.Capacity.HasValue && goingCount >= ev.Capacity.Value)
        {
            var pos = db.Rsvps.Count(r => r.EventId == eventId && r.Status == "Waitlisted") + 1;
            db.Rsvps.Add(new RsvpRow { EventId = eventId, UserId = user.Id, Status = "Waitlisted", WaitlistPosition = pos });
            db.SaveChanges();
            return Ok(new RsvpResponse("Waitlisted", pos));
        }

        db.Rsvps.Add(new RsvpRow { EventId = eventId, UserId = user.Id, Status = "Going" });
        db.SaveChanges();
        return Ok(new RsvpResponse("Going"));
    }

    [HttpGet("requests")]
    public IActionResult GetRequests(string eventId)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var pending = db.Rsvps
            .Where(r => r.EventId == eventId && r.Status == "PendingApproval")
            .Select(r => new PendingRsvpDto(r.UserId, r.UserId, $"User {r.UserId}", DateTimeOffset.UtcNow.ToString("O")))
            .ToList();
        return Ok(new { items = pending, total = pending.Count });
    }

    [HttpPost("requests/{rsvpUserId}/approve")]
    public IActionResult Approve(string eventId, string rsvpUserId)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var rsvp = db.Rsvps.Find(eventId, rsvpUserId);
        if (rsvp is null || rsvp.Status != "PendingApproval") return NotFound();
        rsvp.Status = "Going";
        rsvp.WaitlistPosition = null;
        db.SaveChanges();
        return Ok();
    }

    [HttpPost("requests/{rsvpUserId}/deny")]
    public IActionResult Deny(string eventId, string rsvpUserId)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var rsvp = db.Rsvps.Find(eventId, rsvpUserId);
        if (rsvp is null || rsvp.Status != "PendingApproval") return NotFound();
        db.Rsvps.Remove(rsvp);
        db.SaveChanges();
        return Ok();
    }

    private SeedUser? GetCurrentUser()
    {
        var userId = User.FindFirst("sub")?.Value ?? "";
        return string.IsNullOrEmpty(userId) || !SeedUsers.ById.TryGetValue(userId, out var user) ? null : user;
    }
}
