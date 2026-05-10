// traces_to: L2-045
// Traces to: TASK-0228
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Auth;

namespace TheUpperRoom.Api.Kanban;

[ApiController]
[Authorize]
[Route("api/v1/cards")]
public sealed class CardsController(IMediator mediator, ICurrentUser currentUser) : ControllerBase
{
    [HttpPatch("{id}")]
    public async Task<IActionResult> Patch(string id, [FromBody] Dictionary<string, object?>? body, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new PatchCardCommand(currentUser.UserId ?? "", id, body), cancellationToken);
        return Map(result.Outcome, result.Payload);
    }

    [HttpPost("{id}/move")]
    public async Task<IActionResult> Move(string id, [FromBody] MoveCardRequest? body, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new MoveCardCommand(currentUser.UserId ?? "", id, body?.TargetColumnId), cancellationToken);
        return Map(result.Outcome, result.Payload);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new DeleteCardCommand(currentUser.UserId ?? "", id), cancellationToken);
        return result.Outcome switch
        {
            KanbanOutcome.Unauthorized => Unauthorized(),
            KanbanOutcome.NotFound => NotFound(),
            KanbanOutcome.Ok => NoContent(),
            _ => StatusCode(500),
        };
    }

    private IActionResult Map(KanbanOutcome outcome, object? payload) => outcome switch
    {
        KanbanOutcome.Unauthorized => Unauthorized(),
        KanbanOutcome.NotFound => NotFound(),
        KanbanOutcome.BadRequest => BadRequest(),
        KanbanOutcome.Unprocessable => UnprocessableEntity(payload),
        KanbanOutcome.Ok => Ok(payload),
        _ => StatusCode(500),
    };
}
