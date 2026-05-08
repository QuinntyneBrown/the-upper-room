// traces_to: L2-045
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Rbac;

namespace TheUpperRoom.Api.Kanban;

[ApiController]
[Route("api/v1/cards")]
public sealed class CardsController : ControllerBase
{
    [HttpPost("{id}/move")]
    public IActionResult Move(string id, [FromBody] MoveCardRequest? body)
    {
        var user = CurrentUser();
        if (user is null) return Unauthorized();
        if (body is null || string.IsNullOrWhiteSpace(body.TargetColumnId))
        {
            return UnprocessableEntity(new { error = "targetColumnId is required." });
        }

        return Ok(new { id, columnId = body.TargetColumnId });
    }

    private SeedUser? CurrentUser()
    {
        var userId = Request.Headers["X-Test-User-Id"].ToString();
        return string.IsNullOrEmpty(userId) || !SeedUsers.ById.TryGetValue(userId, out var user)
            ? null
            : user;
    }
}

public sealed record MoveCardRequest(string? TargetColumnId, string? SourceColumnId);
