using MediatR;

namespace TheUpperRoom.Application.Notes;

public sealed record GetNoteQuery(string UserId, string Id) : IRequest<NoteResult>;
