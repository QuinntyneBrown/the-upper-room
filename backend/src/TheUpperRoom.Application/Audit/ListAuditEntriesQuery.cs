using MediatR;

namespace TheUpperRoom.Application.Audit;

public sealed record ListAuditEntriesQuery(
    string UserId,
    string? Actor,
    string? EntityType,
    string? Action,
    DateTimeOffset? From,
    DateTimeOffset? To,
    int Page,
    int PageSize) : IRequest<ListAuditEntriesResult>;
