using MediatR;

namespace TheUpperRoom.Application.Notes;

public sealed record DeleteNoteCommand(string UserId, string Id) : IRequest<NoteResult>;
