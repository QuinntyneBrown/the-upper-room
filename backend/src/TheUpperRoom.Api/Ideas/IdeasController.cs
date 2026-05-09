// traces_to: L2-048, L2-049, L2-050, L2-051, L2-052
using Ganss.Xss;
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Rbac;

namespace TheUpperRoom.Api.Ideas;

[ApiController]
[Route("api/v1/ideas")]
public sealed class IdeasController : ControllerBase
{
    private sealed class IdeaRecord(
        string id, string title, string description,
        string bodyMarkdown, string bodyHtmlSanitized, string? coverImageUrl,
        string status, string proposedBy, DateTimeOffset createdAt, DateTimeOffset updatedAt, string[] tags)
    {
        public string Id { get; } = id;
        public string Title { get; } = title;
        public string Description { get; } = description;
        public string BodyMarkdown { get; set; } = bodyMarkdown;
        public string BodyHtmlSanitized { get; set; } = bodyHtmlSanitized;
        public string? CoverImageUrl { get; set; } = coverImageUrl;
        public string Status { get; set; } = status;
        public string ProposedBy { get; } = proposedBy;
        public DateTimeOffset CreatedAt { get; } = createdAt;
        public DateTimeOffset UpdatedAt { get; } = updatedAt;
        public string[] Tags { get; } = tags;
    }

    private static readonly HtmlSanitizer _sanitizer = BuildSanitizer();
    private static readonly List<IdeaRecord> _store = [];
    private static readonly List<(string IdeaId, string UserId)> _votes = [];
    private static readonly List<(string IdeaId, string PartnerId, string PartnerName)> _ideaPartners = [];

    private static readonly Dictionary<string, string[]> _proposerTransitions = new()
    {
        ["Draft"] = ["Submitted"],
    };

    private static readonly Dictionary<string, string[]> _leadTransitions = new()
    {
        ["Draft"]       = ["Submitted"],
        ["Submitted"]   = ["UnderReview", "Selected", "Archived"],
        ["UnderReview"] = ["Selected", "InProgress", "Archived"],
        ["Selected"]    = ["InProgress", "Archived"],
        ["InProgress"]  = ["Completed", "Archived"],
    };

    private static HtmlSanitizer BuildSanitizer()
    {
        var s = new HtmlSanitizer();
        s.AllowedTags.Clear();
        s.AllowedTags.UnionWith(["p", "h1", "h2", "h3", "h4", "h5", "h6",
            "ul", "ol", "li", "a", "code", "pre", "em", "strong", "blockquote", "br"]);
        return s;
    }

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

    [HttpGet("{id}")]
    public IActionResult GetById(string id)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var idea = _store.FirstOrDefault(i => i.Id == id);
        if (idea is null) return NotFound();

        return Ok(ToDto(idea, user.Id));
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

    [HttpPost("{id}/status")]
    public IActionResult ChangeStatus(string id, [FromBody] ChangeStatusRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var idea = _store.FirstOrDefault(i => i.Id == id);
        if (idea is null) return NotFound();
        if (body is null) return BadRequest();

        var isLead = user.Role is Roles.CityLead or Roles.SystemAdmin;
        var isProposer = idea.ProposedBy == user.Id;

        var transitions = isLead ? _leadTransitions : (isProposer ? _proposerTransitions : new());

        if (!transitions.TryGetValue(idea.Status, out var allowed) || !allowed.Contains(body.Status))
            return UnprocessableEntity(new { error = "Invalid status transition." });

        idea.Status = body.Status;
        return Ok(ToDto(idea, user.Id));
    }

    [HttpPatch("{id}")]
    public IActionResult Update(string id, [FromBody] UpdateIdeaRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var idea = _store.FirstOrDefault(i => i.Id == id);
        if (idea is null) return NotFound();

        if (body?.BodyMarkdown is not null)
        {
            idea.BodyMarkdown = body.BodyMarkdown;
            idea.BodyHtmlSanitized = _sanitizer.Sanitize(body.BodyMarkdown);
        }

        if (body?.CoverImageUrl is not null)
            idea.CoverImageUrl = body.CoverImageUrl;

        return Ok(ToDto(idea, user.Id));
    }

    [HttpPost("{id}/cover")]
    public IActionResult UploadCover(string id, IFormFile? file)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var idea = _store.FirstOrDefault(i => i.Id == id);
        if (idea is null) return NotFound();

        var url = $"/uploads/cover-{id}-{Guid.NewGuid():N}.jpg";
        idea.CoverImageUrl = url;
        return Ok(ToDto(idea, user.Id));
    }

    [HttpGet("{id}/partners")]
    public IActionResult ListPartners(string id)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var items = _ideaPartners
            .Where(p => p.IdeaId == id)
            .Select(p => new LinkedPartnerRefDto(p.PartnerId, p.PartnerName))
            .ToArray();
        return Ok(new { items });
    }

    [HttpPost("{id}/partners")]
    public IActionResult LinkPartner(string id, [FromBody] LinkIdeaPartnerRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();
        if (body is null) return BadRequest();

        if (_ideaPartners.Any(p => p.IdeaId == id && p.PartnerId == body.PartnerId))
            return Conflict(new { error = "Partner already linked." });

        _ideaPartners.Add((id, body.PartnerId, body.PartnerName ?? body.PartnerId));
        return StatusCode(201, new { partnerId = body.PartnerId });
    }

    [HttpDelete("{id}/partners/{partnerId}")]
    public IActionResult UnlinkPartner(string id, string partnerId)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var idx = _ideaPartners.FindIndex(p => p.IdeaId == id && p.PartnerId == partnerId);
        if (idx < 0) return NotFound();
        _ideaPartners.RemoveAt(idx);
        return NoContent();
    }

    private IdeaDto ToDto(IdeaRecord idea, string userId) => new(
        idea.Id, idea.Title, idea.Description,
        idea.BodyMarkdown, idea.BodyHtmlSanitized, idea.CoverImageUrl,
        idea.Status,
        VoteCount: _votes.Count(v => v.IdeaId == idea.Id),
        HasVoted: _votes.Any(v => v.IdeaId == idea.Id && v.UserId == userId),
        idea.ProposedBy, idea.CreatedAt, idea.UpdatedAt, idea.Tags,
        LinkedPartners: _ideaPartners
            .Where(p => p.IdeaId == idea.Id)
            .Select(p => new LinkedPartnerRefDto(p.PartnerId, p.PartnerName))
            .ToArray());

    private SeedUser? GetCurrentUser()
    {
        var userId = Request.Headers["X-Test-User-Id"].ToString();
        return string.IsNullOrEmpty(userId) || !SeedUsers.ById.TryGetValue(userId, out var user)
            ? null
            : user;
    }
}

public sealed record UpdateIdeaRequest(string? BodyMarkdown, string? CoverImageUrl);
public sealed record ChangeStatusRequest(string Status);
public sealed record LinkIdeaPartnerRequest(string PartnerId, string? PartnerName = null);
