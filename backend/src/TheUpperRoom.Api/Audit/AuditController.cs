// traces_to: L2-098
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Rbac;

namespace TheUpperRoom.Api.Audit;

[ApiController]
[Route("api/v1/admin/audit")]
public sealed class AuditController : ControllerBase
{
    [HttpGet]
    public IActionResult List(
        [FromQuery] string? actor,
        [FromQuery] string? entityType,
        [FromQuery] string? action,
        [FromQuery] DateTimeOffset? from,
        [FromQuery] DateTimeOffset? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        if (user.Role != Roles.SystemAdmin)
        {
            AuditStore.Record(user.Id, "AdminAudit", "audit", "PermissionDenied");
            return StatusCode(403, new { error = "Forbidden" });
        }

        var query = AuditStore.Entries.AsEnumerable();
        if (!string.IsNullOrEmpty(actor)) query = query.Where(e => e.ActorUserId == actor);
        if (!string.IsNullOrEmpty(entityType)) query = query.Where(e => e.EntityType == entityType);
        if (!string.IsNullOrEmpty(action)) query = query.Where(e => e.Action == action);
        if (from.HasValue) query = query.Where(e => e.Timestamp >= from.Value);
        if (to.HasValue) query = query.Where(e => e.Timestamp <= to.Value);

        var all = query.OrderByDescending(e => e.Timestamp).ToList();
        var total = all.Count;
        var items = all
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(e => new AuditEntryDto(e.Id, e.Timestamp, e.ActorUserId, e.EntityType, e.EntityId, e.Action, e.BeforeJson, e.AfterJson))
            .ToList();

        return Ok(new { items, total, page, pageSize });
    }

    private SeedUser? GetCurrentUser()
    {
        var userId = Request.Headers["X-Test-User-Id"].ToString();
        return string.IsNullOrEmpty(userId) || !SeedUsers.ById.TryGetValue(userId, out var user) ? null : user;
    }
}
