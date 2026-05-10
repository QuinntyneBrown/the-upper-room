using MediatR;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Infrastructure.Notes;

namespace TheUpperRoom.Api.Notes;

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
