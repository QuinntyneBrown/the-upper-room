using Ganss.Xss;
using MediatR;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Domain.Notes;

namespace TheUpperRoom.Api.Notes;

public enum NotesOutcome
{
    Ok,
    Created,
    NoContent,
    Unauthorized,
    NotFound,
    BadRequest,
    Unprocessable,
}

public sealed record ListNotesQuery(string UserId, string? SubjectType, string? SubjectId) : IRequest<ListNotesResult>;
public sealed record ListNotesResult(NoteDto[] Items, NotesOutcome Outcome, string? Error);

public sealed record GetNoteQuery(string UserId, string Id) : IRequest<NoteResult>;
public sealed record CreateNoteCommand(string UserId, CreateNoteRequest? Body) : IRequest<NoteResult>;
public sealed record UpdateNoteCommand(string UserId, string Id, UpdateNoteRequest? Body) : IRequest<NoteResult>;
public sealed record DeleteNoteCommand(string UserId, string Id) : IRequest<NoteResult>;

public sealed record NoteResult(NoteDto? Note, NotesOutcome Outcome, string? Error);

internal static class NotesSanitizer
{
    private static readonly HtmlSanitizer _sanitizer = Build();

    public static HtmlSanitizer Instance => _sanitizer;

    private static HtmlSanitizer Build()
    {
        var s = new HtmlSanitizer();
        s.AllowedTags.Clear();
        s.AllowedTags.UnionWith(["p", "h1", "h2", "h3", "h4", "h5", "h6",
            "ul", "ol", "li", "a", "code", "pre", "em", "strong", "blockquote", "br"]);
        return s;
    }

    public static NoteDto ToDto(NoteRow r) => new(
        r.Id, r.SubjectType, r.SubjectId, r.BodyMarkdown, r.BodyHtmlSanitized,
        r.CreatedBy, r.CreatedAt, r.UpdatedAt,
        r.History.Select(h => new NoteVersionDto(h.Id, h.BodyMarkdown, h.BodyHtmlSanitized, h.CreatedAt, h.CreatedBy)).ToArray());
}

internal sealed class ListNotesHandler : IRequestHandler<ListNotesQuery, ListNotesResult>
{
    private readonly NotesDbContext _db;
    private readonly IUserDirectory _users;

    public ListNotesHandler(NotesDbContext db, IUserDirectory users)
    {
        _db = db;
        _users = users;
    }

    public Task<ListNotesResult> Handle(ListNotesQuery request, CancellationToken cancellationToken)
    {
        if (_users.GetById(request.UserId) is null)
            return Task.FromResult(new ListNotesResult(Array.Empty<NoteDto>(), NotesOutcome.Unauthorized, null));

        if (!Enum.TryParse<NoteSubjectType>(request.SubjectType, ignoreCase: true, out var type))
            return Task.FromResult(new ListNotesResult(Array.Empty<NoteDto>(), NotesOutcome.BadRequest, "Invalid subjectType."));

        var typeName = type.ToString();
        var items = _db.Notes
            .Where(n => n.SubjectType == typeName && n.SubjectId == request.SubjectId)
            .AsEnumerable()
            .Select(NotesSanitizer.ToDto)
            .ToArray();

        return Task.FromResult(new ListNotesResult(items, NotesOutcome.Ok, null));
    }
}

internal sealed class GetNoteHandler : IRequestHandler<GetNoteQuery, NoteResult>
{
    private readonly NotesDbContext _db;
    private readonly IUserDirectory _users;

    public GetNoteHandler(NotesDbContext db, IUserDirectory users)
    {
        _db = db;
        _users = users;
    }

    public Task<NoteResult> Handle(GetNoteQuery request, CancellationToken cancellationToken)
    {
        if (_users.GetById(request.UserId) is null)
            return Task.FromResult(new NoteResult(null, NotesOutcome.Unauthorized, null));

        var row = _db.Notes.Find(request.Id);
        return Task.FromResult(row is null
            ? new NoteResult(null, NotesOutcome.NotFound, null)
            : new NoteResult(NotesSanitizer.ToDto(row), NotesOutcome.Ok, null));
    }
}

internal sealed class CreateNoteHandler : IRequestHandler<CreateNoteCommand, NoteResult>
{
    private readonly NotesDbContext _db;
    private readonly IUserDirectory _users;

    public CreateNoteHandler(NotesDbContext db, IUserDirectory users)
    {
        _db = db;
        _users = users;
    }

    public Task<NoteResult> Handle(CreateNoteCommand request, CancellationToken cancellationToken)
    {
        var user = _users.GetById(request.UserId);
        if (user is null) return Task.FromResult(new NoteResult(null, NotesOutcome.Unauthorized, null));
        if (request.Body is null) return Task.FromResult(new NoteResult(null, NotesOutcome.BadRequest, null));
        if (string.IsNullOrWhiteSpace(request.Body.BodyMarkdown))
            return Task.FromResult(new NoteResult(null, NotesOutcome.Unprocessable, "Body is required."));
        if (!Enum.TryParse<NoteSubjectType>(request.Body.SubjectType, ignoreCase: true, out var subjectType))
            return Task.FromResult(new NoteResult(null, NotesOutcome.Unprocessable, "Invalid subjectType."));

        var sanitized = NotesSanitizer.Instance.Sanitize(request.Body.BodyMarkdown);
        var now = DateTimeOffset.UtcNow;
        var row = new NoteRow
        {
            Id = Guid.NewGuid().ToString("N"),
            SubjectType = subjectType.ToString(),
            SubjectId = request.Body.SubjectId,
            BodyMarkdown = request.Body.BodyMarkdown,
            BodyHtmlSanitized = sanitized,
            CreatedBy = user.Id,
            CreatedAt = now,
            UpdatedBy = user.Id,
            UpdatedAt = now,
        };
        _db.Notes.Add(row);
        _db.SaveChanges();
        return Task.FromResult(new NoteResult(NotesSanitizer.ToDto(row), NotesOutcome.Created, null));
    }
}

internal sealed class UpdateNoteHandler : IRequestHandler<UpdateNoteCommand, NoteResult>
{
    private const int MaxHistoryVersions = 20;
    private readonly NotesDbContext _db;
    private readonly IUserDirectory _users;

    public UpdateNoteHandler(NotesDbContext db, IUserDirectory users)
    {
        _db = db;
        _users = users;
    }

    public Task<NoteResult> Handle(UpdateNoteCommand request, CancellationToken cancellationToken)
    {
        var user = _users.GetById(request.UserId);
        if (user is null) return Task.FromResult(new NoteResult(null, NotesOutcome.Unauthorized, null));

        var row = _db.Notes.Find(request.Id);
        if (row is null) return Task.FromResult(new NoteResult(null, NotesOutcome.NotFound, null));
        if (request.Body is null) return Task.FromResult(new NoteResult(null, NotesOutcome.BadRequest, null));
        if (string.IsNullOrWhiteSpace(request.Body.BodyMarkdown))
            return Task.FromResult(new NoteResult(null, NotesOutcome.Unprocessable, "Body is required."));

        var now = DateTimeOffset.UtcNow;
        var newHistory = new List<NoteHistoryEntry>(row.History.Count + 1)
        {
            new(Guid.NewGuid().ToString("N"), row.BodyMarkdown, row.BodyHtmlSanitized, row.UpdatedAt, row.UpdatedBy),
        };
        newHistory.AddRange(row.History.Take(MaxHistoryVersions - 1));
        row.History = newHistory;

        row.BodyMarkdown = request.Body.BodyMarkdown;
        row.BodyHtmlSanitized = NotesSanitizer.Instance.Sanitize(request.Body.BodyMarkdown);
        row.UpdatedBy = user.Id;
        row.UpdatedAt = now;
        _db.SaveChanges();
        return Task.FromResult(new NoteResult(NotesSanitizer.ToDto(row), NotesOutcome.Ok, null));
    }
}

internal sealed class DeleteNoteHandler : IRequestHandler<DeleteNoteCommand, NoteResult>
{
    private readonly NotesDbContext _db;
    private readonly IUserDirectory _users;

    public DeleteNoteHandler(NotesDbContext db, IUserDirectory users)
    {
        _db = db;
        _users = users;
    }

    public Task<NoteResult> Handle(DeleteNoteCommand request, CancellationToken cancellationToken)
    {
        if (_users.GetById(request.UserId) is null)
            return Task.FromResult(new NoteResult(null, NotesOutcome.Unauthorized, null));

        var row = _db.Notes.Find(request.Id);
        if (row is null) return Task.FromResult(new NoteResult(null, NotesOutcome.NotFound, null));

        _db.Notes.Remove(row);
        _db.SaveChanges();
        return Task.FromResult(new NoteResult(null, NotesOutcome.NoContent, null));
    }
}
