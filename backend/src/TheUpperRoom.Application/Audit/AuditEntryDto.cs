// traces_to: L2-098
namespace TheUpperRoom.Application.Audit;

public sealed record AuditEntryDto(
    string Id,
    DateTimeOffset Timestamp,
    string ActorUserId,
    string EntityType,
    string EntityId,
    string Action,
    string? BeforeJson,
    string? AfterJson);
