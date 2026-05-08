// traces_to: L2-023
using Microsoft.AspNetCore.Mvc;

namespace TheUpperRoom.Api.Rbac;

[ApiController]
[Route("api/v1/users")]
public sealed class UsersController : ControllerBase
{
    [HttpGet("me")]
    public ActionResult<MeResponse> Me()
    {
        var userId = Request.Headers["X-Test-User-Id"].ToString();
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
