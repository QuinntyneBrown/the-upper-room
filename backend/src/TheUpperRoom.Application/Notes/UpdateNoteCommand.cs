using MediatR;

namespace TheUpperRoom.Application.Notes;

public sealed record UpdateNoteCommand(string UserId, string Id, UpdateNoteRequest? Body) : IRequest<NoteResult>;
