// traces_to: L2-041, L2-093
using Ganss.Xss;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Rbac;
using TheUpperRoom.Domain.Notes;

namespace TheUpperRoom.Api.Notes;

[ApiController]
[Authorize]
[Route("api/v1/notes")]
public sealed class NotesController(NotesDbContext db) : ControllerBase
{
    private const int MaxHistoryVersions = 20;

    private static readonly HtmlSanitizer _sanitizer = BuildSanitizer();

    private static HtmlSanitizer BuildSanitizer()
    {
        var s = new HtmlSanitizer();
        s.AllowedTags.Clear();
        s.AllowedTags.UnionWith(["p", "h1", "h2", "h3", "h4", "h5", "h6",
            "ul", "ol", "li", "a", "code", "pre", "em", "strong", "blockquote", "br"]);
        return s;
    }

    [HttpGet]
    public IActionResult List([FromQuery] string? subjectType, [FromQuery] string? subjectId)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        if (!Enum.TryParse<NoteSubjectType>(subjectType, ignoreCase: true, out var type))
            return BadRequest(new { error = "Invalid subjectType." });

        var typeName = type.ToString();
        var items = db.Notes
            .Where(n => n.SubjectType == typeName && n.SubjectId == subjectId)
            .AsEnumerable()
            .Select(ToDto)
            .ToArray();

        return Ok(new { items, total = items.Length });
    }

    [HttpGet("{id}")]
    public ActionResult<NoteDto> GetById(string id)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var row = db.Notes.Find(id);
        return row is null ? NotFound() : Ok(ToDto(row));
    }

    [HttpPost]
    public ActionResult<NoteDto> Create([FromBody] CreateNoteRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        if (body is null) return BadRequest();
        if (string.IsNullOrWhiteSpace(body.BodyMarkdown))
            return UnprocessableEntity(new { error = "Body is required." });
        if (!Enum.TryParse<NoteSubjectType>(body.SubjectType, ignoreCase: true, out var subjectType))
            return UnprocessableEntity(new { error = "Invalid subjectType." });

        var sanitized = _sanitizer.Sanitize(body.BodyMarkdown);
        var now = DateTimeOffset.UtcNow;
        var row = new NoteRow
        {
            Id = Guid.NewGuid().ToString("N"),
            SubjectType = subjectType.ToString(),
            SubjectId = body.SubjectId,
            BodyMarkdown = body.BodyMarkdown,
            BodyHtmlSanitized = sanitized,
            CreatedBy = user.Id,
            CreatedAt = now,
            UpdatedBy = user.Id,
            UpdatedAt = now,
        };
        db.Notes.Add(row);
        db.SaveChanges();
        return Created($"/api/v1/notes/{row.Id}", ToDto(row));
    }

    [HttpPut("{id}")]
    public ActionResult<NoteDto> Update(string id, [FromBody] UpdateNoteRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var row = db.Notes.Find(id);
        if (row is null) return NotFound();

        if (body is null) return BadRequest();
        if (string.IsNullOrWhiteSpace(body.BodyMarkdown))
            return UnprocessableEntity(new { error = "Body is required." });

        var now = DateTimeOffset.UtcNow;
        var newHistory = new List<NoteHistoryEntry>(row.History.Count + 1)
        {
            new(Guid.NewGuid().ToString("N"), row.BodyMarkdown, row.BodyHtmlSanitized, row.UpdatedAt, row.UpdatedBy),
        };
        newHistory.AddRange(row.History.Take(MaxHistoryVersions - 1));
        row.History = newHistory;

        row.BodyMarkdown = body.BodyMarkdown;
        row.BodyHtmlSanitized = _sanitizer.Sanitize(body.BodyMarkdown);
        row.UpdatedBy = user.Id;
        row.UpdatedAt = now;
        db.SaveChanges();
        return Ok(ToDto(row));
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var row = db.Notes.Find(id);
        if (row is null) return NotFound();

        db.Notes.Remove(row);
        db.SaveChanges();
        return NoContent();
    }

    private static NoteDto ToDto(NoteRow r) => new(
        r.Id,
        r.SubjectType,
        r.SubjectId,
        r.BodyMarkdown,
        r.BodyHtmlSanitized,
        r.CreatedBy,
        r.CreatedAt,
        r.UpdatedAt,
        r.History.Select(h => new NoteVersionDto(h.Id, h.BodyMarkdown, h.BodyHtmlSanitized, h.CreatedAt, h.CreatedBy)).ToArray());

    private SeedUser? GetCurrentUser()
    {
        var userId = User.FindFirst("sub")?.Value ?? "";
        return string.IsNullOrEmpty(userId) || !SeedUsers.ById.TryGetValue(userId, out var user)
            ? null
            : user;
    }
}
