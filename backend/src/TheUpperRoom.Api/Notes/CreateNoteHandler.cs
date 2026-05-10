using MediatR;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Domain.Notes;

namespace TheUpperRoom.Api.Notes;

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
