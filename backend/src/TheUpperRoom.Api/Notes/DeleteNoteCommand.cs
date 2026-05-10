using MediatR;

namespace TheUpperRoom.Api.Notes;

public sealed record DeleteNoteCommand(string UserId, string Id) : IRequest<NoteResult>;
