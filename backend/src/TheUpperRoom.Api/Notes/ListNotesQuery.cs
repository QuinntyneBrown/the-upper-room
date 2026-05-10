using MediatR;

namespace TheUpperRoom.Api.Notes;

public sealed record ListNotesQuery(string UserId, string? SubjectType, string? SubjectId) : IRequest<ListNotesResult>;
