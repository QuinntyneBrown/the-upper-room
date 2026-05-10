// traces_to: L2-098
namespace TheUpperRoom.Application.Audit;

public static class AuditStore
{
    public static readonly List<AuditEntryRecord> Entries = [];

    public static void Record(
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
