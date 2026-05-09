// traces_to: L2-052, L2-055
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Auth;

namespace TheUpperRoom.Api.Events;

public sealed record RsvpRequest(string Status);
public sealed record RsvpResponse(string RsvpStatus, int? WaitlistPosition = null, string? PromotedUser = null);
public sealed record PendingRsvpDto(string Id, string UserId, string UserName, string RequestedAt);

[ApiController]
[Authorize]
[Route("api/v1/events/{eventId}/rsvp")]
public sealed class EventRsvpController(IMediator mediator, ICurrentUser currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMy(string eventId, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetMyRsvpQuery(currentUser.UserId ?? "", eventId), cancellationToken);
        return result.Outcome switch
        {
            RsvpOutcome.Unauthorized => Unauthorized(),
            RsvpOutcome.Ok when result.Status is null => Ok(new { rsvpStatus = (string?)null }),
            RsvpOutcome.Ok => Ok(new { rsvpStatus = result.Status, waitlistPosition = result.WaitlistPosition }),
            _ => StatusCode(500),
        };
    }

    [HttpPost]
    public async Task<IActionResult> Submit(string eventId, [FromBody] RsvpRequest? body, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new SubmitRsvpCommand(currentUser.UserId ?? "", eventId, body), cancellationToken);
        return result.Outcome switch
        {
            RsvpOutcome.Unauthorized => Unauthorized(),
            RsvpOutcome.BadRequest => BadRequest(),
            RsvpOutcome.NotFound => NotFound(),
            RsvpOutcome.Ok => Ok(result.Response),
            _ => StatusCode(500),
        };
    }

    [HttpGet("requests")]
    public async Task<IActionResult> GetRequests(string eventId, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetRsvpRequestsQuery(currentUser.UserId ?? "", eventId), cancellationToken);
        return result.Outcome switch
        {
            RsvpOutcome.Unauthorized => Unauthorized(),
            RsvpOutcome.Ok => Ok(new { items = result.Items, total = result.Items.Length }),
            _ => StatusCode(500),
        };
    }

    [HttpPost("requests/{rsvpUserId}/approve")]
    public async Task<IActionResult> Approve(string eventId, string rsvpUserId, CancellationToken cancellationToken)
    {
        var outcome = await mediator.Send(new ApproveRsvpCommand(currentUser.UserId ?? "", eventId, rsvpUserId), cancellationToken);
        return outcome switch
        {
            RsvpOutcome.Unauthorized => Unauthorized(),
            RsvpOutcome.NotFound => NotFound(),
            RsvpOutcome.Ok => Ok(),
            _ => StatusCode(500),
        };
    }

    [HttpPost("requests/{rsvpUserId}/deny")]
    public async Task<IActionResult> Deny(string eventId, string rsvpUserId, CancellationToken cancellationToken)
    {
        var outcome = await mediator.Send(new DenyRsvpCommand(currentUser.UserId ?? "", eventId, rsvpUserId), cancellationToken);
        return outcome switch
        {
            RsvpOutcome.Unauthorized => Unauthorized(),
            RsvpOutcome.NotFound => NotFound(),
            RsvpOutcome.Ok => Ok(),
            _ => StatusCode(500),
        };
    }
}
