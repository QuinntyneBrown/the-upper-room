using MediatR;

namespace TheUpperRoom.Api.Notes;

public sealed record UpdateNoteCommand(string UserId, string Id, UpdateNoteRequest? Body) : IRequest<NoteResult>;
