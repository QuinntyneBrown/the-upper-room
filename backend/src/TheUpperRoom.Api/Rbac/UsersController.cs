// traces_to: L2-023
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Auth;

namespace TheUpperRoom.Api.Rbac;

[ApiController]
[Authorize]
[Route("api/v1/users")]
public sealed class UsersController(IMediator mediator, ICurrentUser currentUser) : ControllerBase
{
    [HttpGet("me")]
    public async Task<ActionResult<MeResponse>> Me(CancellationToken cancellationToken)
    {
        var response = await mediator.Send(new GetCurrentUserQuery(currentUser.UserId ?? ""), cancellationToken);
        return response is null ? Unauthorized() : Ok(response);
    }
}
