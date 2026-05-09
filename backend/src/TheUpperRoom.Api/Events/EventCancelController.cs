// traces_to: L2-052, L2-055
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Rbac;

namespace TheUpperRoom.Api.Events;

public sealed record CancelEventRequest(string? Message = null);

[ApiController]
[Route("api/v1/events/{id}/cancel")]
public sealed class EventCancelController : ControllerBase
{
    [HttpPost]
    public IActionResult Cancel(string id, [FromBody] CancelEventRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var idx = EventsController.Store.FindIndex(e => e.Id == id);
        if (idx < 0) return NotFound();

        var ev = EventsController.Store[idx];
        EventsController.Store[idx] = ev with { Status = "Cancelled" };

        return Ok(EventsController.Store[idx]);
    }

    private SeedUser? GetCurrentUser()
    {
        var userId = Request.Headers["X-Test-User-Id"].ToString();
        return string.IsNullOrEmpty(userId) || !SeedUsers.ById.TryGetValue(userId, out var user) ? null : user;
    }
}
