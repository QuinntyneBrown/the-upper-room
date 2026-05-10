// traces_to: L2-063
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Auth;

namespace TheUpperRoom.Api.Notifications;

[ApiController]
[Authorize]
[Route("api/v1/push")]
public sealed class PushController(IMediator mediator, ICurrentUser currentUser) : ControllerBase
{
    [HttpGet("vapid-public-key")]
    public async Task<IActionResult> VapidPublicKey(CancellationToken cancellationToken) =>
        Ok(await mediator.Send(new GetVapidPublicKeyQuery(), cancellationToken));

    [HttpPost("subscribe")]
    public async Task<IActionResult> Subscribe([FromBody] PushSubscribeRequest? body, CancellationToken cancellationToken)
    {
        var outcome = await mediator.Send(new SubscribePushCommand(currentUser.UserId ?? "", body), cancellationToken);
        return Map(outcome);
    }

    [HttpDelete("subscribe")]
    public async Task<IActionResult> Unsubscribe(CancellationToken cancellationToken)
    {
        var outcome = await mediator.Send(new UnsubscribePushCommand(currentUser.UserId ?? ""), cancellationToken);
        return Map(outcome);
    }

    private IActionResult Map(PushOutcome outcome) => outcome switch
    {
        PushOutcome.Unauthorized => Unauthorized(),
        PushOutcome.BadRequest => BadRequest(),
        PushOutcome.NoContent => NoContent(),
        _ => StatusCode(500),
    };
}
