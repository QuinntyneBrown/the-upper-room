// traces_to: TASK-0221
using System.Security.Claims;

namespace TheUpperRoom.Api.Auth;

public sealed class CurrentUser : ICurrentUser
{
    private readonly IHttpContextAccessor _accessor;

    public CurrentUser(IHttpContextAccessor accessor) => _accessor = accessor;

    public string? UserId =>
        _accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? _accessor.HttpContext?.User.FindFirstValue("sub");
}
