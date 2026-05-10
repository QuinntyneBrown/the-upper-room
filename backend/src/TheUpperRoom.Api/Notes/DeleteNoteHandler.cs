using MediatR;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Api.Notes;

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
