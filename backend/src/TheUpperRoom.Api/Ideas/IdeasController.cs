// traces_to: L2-048, L2-049
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Rbac;

namespace TheUpperRoom.Api.Ideas;

[ApiController]
[Route("api/v1/ideas")]
public sealed class IdeasController : ControllerBase
{
    private sealed record IdeaRecord(
        string Id, string Title, string Description, string Status,
        string ProposedBy, DateTimeOffset CreatedAt, DateTimeOffset UpdatedAt, string[] Tags);

    private static readonly List<IdeaRecord> _store = [];
    private static readonly List<(string IdeaId, string UserId)> _votes = [];

    [HttpGet]
    public IActionResult List(
        [FromQuery] string? status,
        [FromQuery] string? tag,
        [FromQuery] bool myIdeas = false,
        [FromQuery] string? sort = null)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var query = _store.AsEnumerable();

        if (!string.IsNullOrEmpty(status))
            query = query.Where(i => i.Status.Equals(status, StringComparison.OrdinalIgnoreCase));

        if (!string.IsNullOrEmpty(tag))
            query = query.Where(i => i.Tags.Contains(tag, StringComparer.OrdinalIgnoreCase));

        if (myIdeas)
            query = query.Where(i => i.ProposedBy == user.Id);

        var items = query.Select(i => ToDto(i, user.Id)).ToList();

        items = sort switch
        {
            "votes" => items.OrderByDescending(i => i.VoteCount).ToList(),
            "updated" => items.OrderByDescending(i => i.UpdatedAt).ToList(),
            _ => items.OrderByDescending(i => i.CreatedAt).ToList(),
        };

        return Ok(new { items, total = items.Count });
    }

    [HttpPost("{id}/vote")]
    public IActionResult ToggleVote(string id)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var idea = _store.FirstOrDefault(i => i.Id == id);
        if (idea is null) return NotFound();

        var existing = _votes.FirstOrDefault(v => v.IdeaId == id && v.UserId == user.Id);
        if (existing != default)
            _votes.Remove(existing);
        else
            _votes.Add((id, user.Id));

        return Ok(ToDto(idea, user.Id));
    }

    private IdeaDto ToDto(IdeaRecord idea, string userId) => new(
        idea.Id, idea.Title, idea.Description, idea.Status,
        VoteCount: _votes.Count(v => v.IdeaId == idea.Id),
        HasVoted: _votes.Any(v => v.IdeaId == idea.Id && v.UserId == userId),
        idea.ProposedBy, idea.CreatedAt, idea.UpdatedAt, idea.Tags);

    private SeedUser? GetCurrentUser()
    {
        var userId = Request.Headers["X-Test-User-Id"].ToString();
        return string.IsNullOrEmpty(userId) || !SeedUsers.ById.TryGetValue(userId, out var user)
            ? null
            : user;
    }
}
