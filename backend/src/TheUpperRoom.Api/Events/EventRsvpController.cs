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
public sealed class EventRsvpController : ControllerBase
{
    private static readonly List<(string EventId, string UserId, string Status, int? WaitlistPosition)> _rsvps = [];

    [HttpGet]
    public IActionResult GetMy(string eventId)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var rsvp = _rsvps.FirstOrDefault(r => r.EventId == eventId && r.UserId == user.Id);
        return rsvp == default
            ? Ok(new { rsvpStatus = (string?)null })
            : Ok(new { rsvpStatus = rsvp.Status, waitlistPosition = rsvp.WaitlistPosition });
    }

    [HttpPost]
    public IActionResult Submit(string eventId, [FromBody] RsvpRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();
        if (body is null) return BadRequest();

        var ev = EventsController.Store.FirstOrDefault(e => e.Id == eventId);
        if (ev is null) return NotFound();

        var existing = _rsvps.FirstOrDefault(r => r.EventId == eventId && r.UserId == user.Id);
        string? promotedUser = null;

        if (existing != default)
        {
            if (existing.Status == "Going" && body.Status == "No")
            {
                var waitlisted = _rsvps.FirstOrDefault(r => r.EventId == eventId && r.Status == "Waitlisted");
                if (waitlisted != default)
                {
                    var wi = _rsvps.IndexOf(waitlisted);
                    _rsvps[wi] = (waitlisted.EventId, waitlisted.UserId, "Going", null);
                    promotedUser = waitlisted.UserId;
                }
            }
            _rsvps.Remove(existing);
        }

        if (body.Status == "No")
            return Ok(new RsvpResponse("Cancelled", null, promotedUser));

        if (body.Status == "Maybe")
        {
            _rsvps.Add((eventId, user.Id, "Maybe", null));
            return Ok(new RsvpResponse("Maybe"));
        }

        if (ev.RequiresApproval)
        {
            _rsvps.Add((eventId, user.Id, "PendingApproval", null));
            return Ok(new RsvpResponse("PendingApproval"));
        }

        var goingCount = _rsvps.Count(r => r.EventId == eventId && r.Status == "Going");
        if (ev.Capacity.HasValue && goingCount >= ev.Capacity.Value)
        {
            var pos = _rsvps.Count(r => r.EventId == eventId && r.Status == "Waitlisted") + 1;
            _rsvps.Add((eventId, user.Id, "Waitlisted", pos));
            return Ok(new RsvpResponse("Waitlisted", pos));
        }

        _rsvps.Add((eventId, user.Id, "Going", null));
        return Ok(new RsvpResponse("Going"));
    }

    [HttpGet("requests")]
    public IActionResult GetRequests(string eventId)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var pending = _rsvps
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

        var idx = _rsvps.FindIndex(r => r.EventId == eventId && r.UserId == rsvpUserId && r.Status == "PendingApproval");
        if (idx < 0) return NotFound();
        var r = _rsvps[idx];
        _rsvps[idx] = (r.EventId, r.UserId, "Going", null);
        return Ok();
    }

    [HttpPost("requests/{rsvpUserId}/deny")]
    public IActionResult Deny(string eventId, string rsvpUserId)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var idx = _rsvps.FindIndex(r => r.EventId == eventId && r.UserId == rsvpUserId && r.Status == "PendingApproval");
        if (idx < 0) return NotFound();
        _rsvps.RemoveAt(idx);
        return Ok();
    }

    private SeedUser? GetCurrentUser()
    {
        var userId = User.FindFirst("sub")?.Value ?? "";
        return string.IsNullOrEmpty(userId) || !SeedUsers.ById.TryGetValue(userId, out var user) ? null : user;
    }
}
