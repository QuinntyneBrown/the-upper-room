// traces_to: TASK-0221
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TheUpperRoom.Api.Auth;

[ApiController]
[Route("api/v1/auth/me")]
[Authorize]
public sealed class MeController : ControllerBase
{
    private readonly ICurrentUser _currentUser;

    public MeController(ICurrentUser currentUser) => _currentUser = currentUser;

    [HttpGet]
    public IActionResult Get()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub");
        return Ok(new { userId = sub, currentUserId = _currentUser.UserId });
    }
}
