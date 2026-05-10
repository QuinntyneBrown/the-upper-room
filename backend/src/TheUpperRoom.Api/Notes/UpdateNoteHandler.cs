using MediatR;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Api.Notes;

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
