// traces_to: L2-048, L2-049, L2-050, L2-051, L2-052
using Ganss.Xss;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Auth;
using TheUpperRoom.Application.Rbac;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Domain.Rbac;

namespace TheUpperRoom.Api.Ideas;

[ApiController]
[Authorize]
[Route("api/v1/ideas")]
public sealed class IdeasController(
    IdeasDbContext db,
    ICurrentUser currentUser,
    IUserDirectory userDirectory,
    IPermissionChecker permissions) : ControllerBase
{
    private static readonly HtmlSanitizer _sanitizer = BuildSanitizer();

    internal static int StoreCount(IdeasDbContext db) =>
        db.Ideas.Count(i => i.Status != "Archived" && i.Status != "Completed");

    internal static IEnumerable<(string Id, string Title, string Status)> Search(string term, IdeasDbContext db) =>
        db.Ideas.AsEnumerable()
            .Where(i => i.Title.Contains(term, StringComparison.OrdinalIgnoreCase))
            .Select(i => (i.Id, i.Title, i.Status));

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

        var query = db.Ideas.AsEnumerable();

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

    [HttpPost]
    public IActionResult Create([FromBody] CreateIdeaRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();
        if (body is null || string.IsNullOrWhiteSpace(body.Title))
            return UnprocessableEntity(new { error = "Title is required." });

        var now = DateTimeOffset.UtcNow;
        var idea = new IdeaRow
        {
            Id = Guid.NewGuid().ToString("N")[..8],
            Title = body.Title.Trim(),
            Description = body.Description?.Trim() ?? "",
            BodyMarkdown = body.BodyMarkdown ?? "",
            BodyHtmlSanitized = string.IsNullOrEmpty(body.BodyMarkdown)
                ? ""
                : _sanitizer.Sanitize(body.BodyMarkdown),
            Status = "Draft",
            ProposedBy = user.Id,
            CreatedAt = now,
            UpdatedAt = now,
            Tags = body.Tags ?? Array.Empty<string>(),
        };
        db.Ideas.Add(idea);
        db.SaveChanges();
        return Created($"/api/v1/ideas/{idea.Id}", new
        {
            id = idea.Id,
            title = idea.Title,
            status = idea.Status,
            proposedBy = idea.ProposedBy,
        });
    }

    [HttpGet("{id}")]
    public IActionResult GetById(string id)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var idea = db.Ideas.Find(id);
        if (idea is null) return NotFound();

        return Ok(ToDto(idea, user.Id));
    }

    [HttpPost("{id}/vote")]
    public IActionResult ToggleVote(string id)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var idea = db.Ideas.Find(id);
        if (idea is null) return NotFound();

        var existing = db.Votes.Find(id, user.Id);
        if (existing is not null)
            db.Votes.Remove(existing);
        else
            db.Votes.Add(new IdeaVoteRow { IdeaId = id, UserId = user.Id });
        db.SaveChanges();

        return Ok(ToDto(idea, user.Id));
    }

    [HttpPost("{id}/status")]
    public IActionResult ChangeStatus(string id, [FromBody] ChangeStatusRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var idea = db.Ideas.Find(id);
        if (idea is null) return NotFound();
        if (body is null) return BadRequest();

        var isLead = permissions.HasPermission(user.Role, PermissionResources.Idea, PermissionActions.Update);
        var isProposer = idea.ProposedBy == user.Id;

        var transitions = isLead ? _leadTransitions : (isProposer ? _proposerTransitions : new());

        if (!transitions.TryGetValue(idea.Status, out var allowed) || !allowed.Contains(body.Status))
            return UnprocessableEntity(new { error = "Invalid status transition." });

        idea.Status = body.Status;
        db.SaveChanges();
        return Ok(ToDto(idea, user.Id));
    }

    [HttpPatch("{id}")]
    public IActionResult Update(string id, [FromBody] UpdateIdeaRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var idea = db.Ideas.Find(id);
        if (idea is null) return NotFound();

        if (body?.BodyMarkdown is not null)
        {
            idea.BodyMarkdown = body.BodyMarkdown;
            idea.BodyHtmlSanitized = _sanitizer.Sanitize(body.BodyMarkdown);
        }

        if (body?.CoverImageUrl is not null)
            idea.CoverImageUrl = body.CoverImageUrl;

        db.SaveChanges();
        return Ok(ToDto(idea, user.Id));
    }

    [HttpPost("{id}/cover")]
    public IActionResult UploadCover(string id, IFormFile? file)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var idea = db.Ideas.Find(id);
        if (idea is null) return NotFound();

        var url = $"/uploads/cover-{id}-{Guid.NewGuid():N}.jpg";
        idea.CoverImageUrl = url;
        db.SaveChanges();
        return Ok(ToDto(idea, user.Id));
    }

    [HttpGet("{id}/partners")]
    public IActionResult ListPartners(string id)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var items = db.Partners
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

        if (db.Partners.Find(id, body.PartnerId) is not null)
            return Conflict(new { error = "Partner already linked." });

        db.Partners.Add(new IdeaPartnerRow
        {
            IdeaId = id,
            PartnerId = body.PartnerId,
            PartnerName = body.PartnerName ?? body.PartnerId,
        });
        db.SaveChanges();
        return StatusCode(201, new { partnerId = body.PartnerId });
    }

    [HttpGet("{id}/comments")]
    public IActionResult ListComments(string id)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();
        var idea = db.Ideas.Find(id);
        if (idea is null) return NotFound();

        var items = db.Comments
            .Where(c => c.IdeaId == id)
            .AsEnumerable()
            .OrderBy(c => c.CreatedAt)
            .Select(c => new { id = c.Id, ideaId = c.IdeaId, body = c.Body, author = c.Author, createdAt = c.CreatedAt })
            .ToArray();
        return Ok(new { items });
    }

    [HttpPost("{id}/comments")]
    public IActionResult CreateComment(string id, [FromBody] CreateCommentRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();
        var idea = db.Ideas.Find(id);
        if (idea is null) return NotFound();
        if (body is null || string.IsNullOrWhiteSpace(body.Body))
            return UnprocessableEntity(new { error = "Body is required." });

        var row = new IdeaCommentRow
        {
            Id = Guid.NewGuid().ToString("N")[..8],
            IdeaId = id,
            Author = user.Id,
            Body = body.Body.Trim(),
            CreatedAt = DateTimeOffset.UtcNow,
        };
        db.Comments.Add(row);
        db.SaveChanges();
        return Created($"/api/v1/ideas/{id}/comments/{row.Id}", new
        {
            id = row.Id,
            ideaId = row.IdeaId,
            body = row.Body,
            author = row.Author,
            createdAt = row.CreatedAt,
        });
    }

    [HttpDelete("{id}/partners/{partnerId}")]
    public IActionResult UnlinkPartner(string id, string partnerId)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var link = db.Partners.Find(id, partnerId);
        if (link is null) return NotFound();
        db.Partners.Remove(link);
        db.SaveChanges();
        return NoContent();
    }

    private IdeaDto ToDto(IdeaRow idea, string userId) => new(
        idea.Id, idea.Title, idea.Description,
        idea.BodyMarkdown, idea.BodyHtmlSanitized, idea.CoverImageUrl,
        idea.Status,
        VoteCount: db.Votes.Count(v => v.IdeaId == idea.Id),
        HasVoted: db.Votes.Any(v => v.IdeaId == idea.Id && v.UserId == userId),
        idea.ProposedBy, idea.CreatedAt, idea.UpdatedAt, idea.Tags,
        LinkedPartners: db.Partners
            .Where(p => p.IdeaId == idea.Id)
            .Select(p => new LinkedPartnerRefDto(p.PartnerId, p.PartnerName))
            .ToArray());

    private AppUser? GetCurrentUser() =>
        userDirectory.GetById(currentUser.UserId ?? "");
}
