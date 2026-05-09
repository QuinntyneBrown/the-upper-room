// traces_to: L2-098
namespace TheUpperRoom.Api.Audit;

internal static class AuditStore
{
    internal static readonly List<AuditEntryRecord> Entries = [];

    internal static void Record(
        string actorUserId,
        string entityType,
        string entityId,
        string action,
        string? beforeJson = null,
        string? afterJson = null)
    {
        Entries.Add(new AuditEntryRecord(
            Guid.NewGuid().ToString(),
            DateTimeOffset.UtcNow,
            actorUserId,
            entityType,
            entityId,
            action,
            beforeJson,
            afterJson));
    }
}

internal sealed record AuditEntryRecord(
    string Id,
    DateTimeOffset Timestamp,
    string ActorUserId,
    string EntityType,
    string EntityId,
    string Action,
    string? BeforeJson,
    string? AfterJson);
