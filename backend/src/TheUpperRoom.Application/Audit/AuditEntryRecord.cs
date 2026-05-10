namespace TheUpperRoom.Application.Audit;

public sealed record AuditEntryRecord(
    string Id,
    DateTimeOffset Timestamp,
    string ActorUserId,
    string EntityType,
    string EntityId,
    string Action,
    string? BeforeJson,
    string? AfterJson);
