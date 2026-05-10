using MediatR;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Domain.Notes;

namespace TheUpperRoom.Api.Notes;

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
