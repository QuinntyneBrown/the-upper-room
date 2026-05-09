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
public sealed class NotesController : ControllerBase
{
    private static readonly List<Note> _store = [];

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

        var items = _store
            .Where(n => n.SubjectType == type && n.SubjectId == subjectId)
            .Select(NoteDto.From)
            .ToArray();

        return Ok(new { items, total = items.Length });
    }

    [HttpGet("{id}")]
    public ActionResult<NoteDto> GetById(string id)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var note = _store.FirstOrDefault(n => n.Id == id);
        return note is null ? NotFound() : Ok(NoteDto.From(note));
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
        var note = new Note(subjectType, body.SubjectId, body.BodyMarkdown, sanitized, user.Id, DateTimeOffset.UtcNow);
        _store.Add(note);

        return Created($"/api/v1/notes/{note.Id}", NoteDto.From(note));
    }

    [HttpPut("{id}")]
    public ActionResult<NoteDto> Update(string id, [FromBody] UpdateNoteRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var note = _store.FirstOrDefault(n => n.Id == id);
        if (note is null) return NotFound();

        if (body is null) return BadRequest();
        if (string.IsNullOrWhiteSpace(body.BodyMarkdown))
            return UnprocessableEntity(new { error = "Body is required." });

        var sanitized = _sanitizer.Sanitize(body.BodyMarkdown);
        note.UpdateBody(body.BodyMarkdown, sanitized, user.Id, DateTimeOffset.UtcNow);

        return Ok(NoteDto.From(note));
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var note = _store.FirstOrDefault(n => n.Id == id);
        if (note is null) return NotFound();

        _store.Remove(note);
        return NoContent();
    }

    private SeedUser? GetCurrentUser()
    {
        var userId = User.FindFirst("sub")?.Value ?? "";
        return string.IsNullOrEmpty(userId) || !SeedUsers.ById.TryGetValue(userId, out var user)
            ? null
            : user;
    }
}
