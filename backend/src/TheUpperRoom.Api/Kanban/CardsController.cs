// traces_to: L2-045
// Traces to: TASK-0228
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Rbac;

namespace TheUpperRoom.Api.Kanban;

[ApiController]
[Authorize]
[Route("api/v1/cards")]
public sealed class CardsController(KanbanDbContext db) : ControllerBase
{
    [HttpPatch("{id}")]
    public IActionResult Patch(string id, [FromBody] Dictionary<string, object?>? body)
    {
        var user = CurrentUser();
        if (user is null) return Unauthorized();
        if (body is null) return BadRequest();

        var card = db.Cards.Find(id);
        if (card is null) return NotFound();

        if (body.TryGetValue("title", out var title) && title is string t) card.Title = t;
        if (body.TryGetValue("assigneeName", out var assignee)) card.AssigneeName = assignee?.ToString();
        if (body.TryGetValue("dueDate", out var due)) card.DueDate = due?.ToString();
        db.SaveChanges();

        return Ok(new { id, patched = body });
    }

    [HttpPost("{id}/move")]
    public IActionResult Move(string id, [FromBody] MoveCardRequest? body)
    {
        var user = CurrentUser();
        if (user is null) return Unauthorized();
        if (body is null || string.IsNullOrWhiteSpace(body.TargetColumnId))
            return UnprocessableEntity(new { error = "targetColumnId is required." });

        var card = db.Cards.Find(id);
        if (card is null) return NotFound();

        card.ColumnId = body.TargetColumnId;
        db.SaveChanges();

        return Ok(new { id, columnId = body.TargetColumnId });
    }

    private SeedUser? CurrentUser()
    {
        var userId = User.FindFirst("sub")?.Value ?? "";
        return string.IsNullOrEmpty(userId) || !SeedUsers.ById.TryGetValue(userId, out var user) ? null : user;
    }
}

public sealed record MoveCardRequest(string? TargetColumnId, string? SourceColumnId);
