using MediatR;
using TheUpperRoom.Application.Rbac;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Domain.Rbac;

namespace TheUpperRoom.Application.Audit;

internal sealed class ListAuditEntriesHandler : IRequestHandler<ListAuditEntriesQuery, ListAuditEntriesResult>
{
    private readonly IUserDirectory _users;
    private readonly IPermissionChecker _permissions;

    public ListAuditEntriesHandler(IUserDirectory users, IPermissionChecker permissions)
    {
        _users = users;
        _permissions = permissions;
    }

    public Task<ListAuditEntriesResult> Handle(ListAuditEntriesQuery request, CancellationToken cancellationToken)
    {
        var user = _users.GetById(request.UserId);
        if (user is null)
            return Task.FromResult(new ListAuditEntriesResult(
                Array.Empty<AuditEntryDto>(), 0, request.Page, request.PageSize, ListAuditEntriesOutcome.Unauthorized));

        if (!_permissions.HasPermission(user.Role, PermissionResources.Audit, PermissionActions.Read))
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
