using MediatR;

namespace TheUpperRoom.Api.Notes;

public sealed record GetNoteQuery(string UserId, string Id) : IRequest<NoteResult>;
