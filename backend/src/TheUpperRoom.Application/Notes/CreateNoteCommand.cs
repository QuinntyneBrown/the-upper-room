using MediatR;

namespace TheUpperRoom.Application.Notes;

public sealed record CreateNoteCommand(string UserId, CreateNoteRequest? Body) : IRequest<NoteResult>;
