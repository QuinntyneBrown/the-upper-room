namespace TheUpperRoom.Api.Audit;

internal sealed record AuditEntryRecord(
    string Id,
    DateTimeOffset Timestamp,
    string ActorUserId,
    string EntityType,
    string EntityId,
    string Action,
    string? BeforeJson,
    string? AfterJson);
