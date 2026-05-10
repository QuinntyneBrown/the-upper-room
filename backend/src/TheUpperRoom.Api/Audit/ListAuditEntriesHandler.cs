using MediatR;
using TheUpperRoom.Api.Rbac;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Api.Audit;

internal sealed class ListAuditEntriesHandler : IRequestHandler<ListAuditEntriesQuery, ListAuditEntriesResult>
{
    private readonly IUserDirectory _users;

    public ListAuditEntriesHandler(IUserDirectory users) => _users = users;

    public Task<ListAuditEntriesResult> Handle(ListAuditEntriesQuery request, CancellationToken cancellationToken)
    {
        var user = _users.GetById(request.UserId);
        if (user is null)
            return Task.FromResult(new ListAuditEntriesResult(
                Array.Empty<AuditEntryDto>(), 0, request.Page, request.PageSize, ListAuditEntriesOutcome.Unauthorized));

        if (user.Role != Roles.SystemAdmin)
        {
            AuditStore.Record(user.Id, "AdminAudit", "audit", "PermissionDenied");
            return Task.FromResult(new ListAuditEntriesResult(
                Array.Empty<AuditEntryDto>(), 0, request.Page, request.PageSize, ListAuditEntriesOutcome.Forbidden));
        }

        var query = AuditStore.Entries.AsEnumerable();
        if (!string.IsNullOrEmpty(request.Actor)) query = query.Where(e => e.ActorUserId == request.Actor);
        if (!string.IsNullOrEmpty(request.EntityType)) query = query.Where(e => e.EntityType == request.EntityType);
        if (!string.IsNullOrEmpty(request.Action)) query = query.Where(e => e.Action == request.Action);
        if (request.From.HasValue) query = query.Where(e => e.Timestamp >= request.From.Value);
        if (request.To.HasValue) query = query.Where(e => e.Timestamp <= request.To.Value);

        var all = query.OrderByDescending(e => e.Timestamp).ToList();
        var total = all.Count;
        var items = all
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(e => new AuditEntryDto(e.Id, e.Timestamp, e.ActorUserId, e.EntityType, e.EntityId, e.Action, e.BeforeJson, e.AfterJson))
            .ToList();

        return Task.FromResult(new ListAuditEntriesResult(items, total, request.Page, request.PageSize, ListAuditEntriesOutcome.Ok));
    }
}
