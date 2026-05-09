// traces_to: L2-023
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TheUpperRoom.Api.Rbac;

[ApiController]
[Authorize]
[Route("api/v1/users")]
public sealed class UsersController : ControllerBase
{
    [HttpGet("me")]
    public ActionResult<MeResponse> Me()
    {
        var userId = User.FindFirst("sub")?.Value ?? "";
        if (string.IsNullOrEmpty(userId) || !SeedUsers.ById.TryGetValue(userId, out var user))
        {
            return Unauthorized();
        }

        return Ok(new MeResponse(
            user.Id,
            user.Email,
            user.City,
            new[] { user.Role },
            Permissions.For(user.Role).ToArray()));
    }
}
