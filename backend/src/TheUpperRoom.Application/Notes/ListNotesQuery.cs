using MediatR;

namespace TheUpperRoom.Application.Notes;

public sealed record ListNotesQuery(string UserId, string? SubjectType, string? SubjectId) : IRequest<ListNotesResult>;
