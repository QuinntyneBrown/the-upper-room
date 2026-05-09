// traces_to: L2-062, L2-063
// Traces to: TASK-0229
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Auth;

namespace TheUpperRoom.Api.Notifications;

[ApiController]
[Authorize]
[Route("api/v1/notifications")]
public sealed class NotificationsController(IMediator mediator, ICurrentUser currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new ListNotificationsQuery(currentUser.UserId ?? ""), cancellationToken);
        return result.Outcome switch
        {
            NotificationsOutcome.Unauthorized => Unauthorized(),
            NotificationsOutcome.Ok => Ok(new { items = result.Items, total = result.Items.Length }),
            _ => StatusCode(500),
        };
    }

    [HttpPost("{id}/read")]
    public async Task<IActionResult> MarkRead(string id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new MarkNotificationReadCommand(currentUser.UserId ?? "", id), cancellationToken);
        return result.Outcome switch
        {
            NotificationsOutcome.Unauthorized => Unauthorized(),
            NotificationsOutcome.NotFound => NotFound(),
            NotificationsOutcome.Ok => Ok(result.Notification),
            _ => StatusCode(500),
        };
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllRead(CancellationToken cancellationToken)
    {
        var outcome = await mediator.Send(new MarkAllNotificationsReadCommand(currentUser.UserId ?? ""), cancellationToken);
        return outcome switch
        {
            NotificationsOutcome.Unauthorized => Unauthorized(),
            NotificationsOutcome.NoContent => NoContent(),
            _ => StatusCode(500),
        };
    }

    [HttpPost("dispatch")]
    public async Task<IActionResult> Dispatch([FromBody] DispatchRequest? body, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new DispatchNotificationCommand(currentUser.UserId ?? "", body), cancellationToken);
        return result.Outcome switch
        {
            NotificationsOutcome.Unauthorized => Unauthorized(),
            NotificationsOutcome.BadRequest => BadRequest(),
            NotificationsOutcome.Unprocessable => UnprocessableEntity(new { error = result.Error }),
            NotificationsOutcome.NoContent => NoContent(),
            _ => StatusCode(500),
        };
    }

    [HttpGet("preferences")]
    public async Task<IActionResult> ListPreferences(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new ListNotificationPreferencesQuery(currentUser.UserId ?? ""), cancellationToken);
        return result.Outcome switch
        {
            NotificationsOutcome.Unauthorized => Unauthorized(),
            NotificationsOutcome.Ok => Ok(result.Items.Select(p => new
            {
                code = p.Code,
                inApp = p.InApp,
                email = p.Email,
                push = p.Push,
            }).ToList()),
            _ => StatusCode(500),
        };
    }

    [HttpPut("preferences")]
    public async Task<IActionResult> UpsertPreference([FromBody] UpsertPreferenceRequest? body, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new UpsertNotificationPreferenceCommand(currentUser.UserId ?? "", body), cancellationToken);
        return result.Outcome switch
        {
            NotificationsOutcome.Unauthorized => Unauthorized(),
            NotificationsOutcome.BadRequest => BadRequest(),
            NotificationsOutcome.Ok => Ok(result.Payload),
            _ => StatusCode(500),
        };
    }
}

public sealed record DispatchRequest(string Code, string[] RecipientIds, Dictionary<string, string>? Data);
public sealed record UpsertPreferenceRequest(string Code, bool InApp, bool Email, bool Push);
