using MediatR;

namespace TheUpperRoom.Application.Contacts;

public sealed record ListContactsQuery(
    string UserId,
    string? Search,
    int? Page,
    int? Size,
    string? Scope,
    bool IncludeArchived = false) : IRequest<ListContactsResult>;
