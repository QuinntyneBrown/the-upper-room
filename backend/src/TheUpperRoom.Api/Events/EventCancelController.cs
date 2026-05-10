// traces_to: L2-052, L2-055
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Auth;
using TheUpperRoom.Application.Events;

namespace TheUpperRoom.Api.Events;

[ApiController]
[Authorize]
[Route("api/v1/events/{id}/cancel")]
public sealed class EventCancelController(IMediator mediator, ICurrentUser currentUser) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Cancel(string id, [FromBody] CancelEventRequest? body, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new CancelEventCommand(currentUser.UserId ?? "", id, body?.Message),
            cancellationToken);

        return result.Outcome switch
        {
            CancelEventOutcome.Unauthorized => Unauthorized(),
            CancelEventOutcome.NotFound => NotFound(),
            CancelEventOutcome.Cancelled => Ok(result.Event),
            _ => StatusCode(500),
        };
    }
}
