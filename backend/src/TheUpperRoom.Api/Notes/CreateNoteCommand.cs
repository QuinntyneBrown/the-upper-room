using MediatR;

namespace TheUpperRoom.Api.Notes;

public sealed record CreateNoteCommand(string UserId, CreateNoteRequest? Body) : IRequest<NoteResult>;
