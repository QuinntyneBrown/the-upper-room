// traces_to: L2-098
namespace TheUpperRoom.Api.Audit;

public sealed record AuditEntryDto(
    string Id,
    DateTimeOffset Timestamp,
    string ActorUserId,
    string EntityType,
    string EntityId,
    string Action,
    string? BeforeJson,
    string? AfterJson);
