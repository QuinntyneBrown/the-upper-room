using TheUpperRoom.Domain.Common;

namespace TheUpperRoom.Domain.Audit;

public sealed class AuditEntry : Entity
{
    public AuditEntry(
        DateTimeOffset timestamp,
        string actorUserId,
        string? cityId,
        string entityType,
        string entityId,
        string action,
        string? beforeJson,
        string? afterJson,
        string correlationId,
        string ip,
        string userAgent,
        string? id = null) : base(id)
    {
        Timestamp = Guard.Utc(timestamp, nameof(Timestamp));
        ActorUserId = Guard.Id(actorUserId, nameof(ActorUserId));
        CityId = Guard.Optional(cityId, nameof(CityId), 100);
        EntityType = Guard.Required(entityType, nameof(EntityType), 100);
        EntityId = Guard.Id(entityId, nameof(EntityId));
        Action = Guard.Required(action, nameof(Action), 100);
        BeforeJson = Guard.Optional(beforeJson, nameof(BeforeJson), 100000);
        AfterJson = Guard.Optional(afterJson, nameof(AfterJson), 100000);
        CorrelationId = Guard.Id(correlationId, nameof(CorrelationId));
        Ip = Guard.Required(ip, nameof(Ip), 100);
        UserAgent = Guard.Required(userAgent, nameof(UserAgent), 500);
    }

    public DateTimeOffset Timestamp { get; }

    public string ActorUserId { get; }

    public string? CityId { get; }

    public string EntityType { get; }

    public string EntityId { get; }

    public string Action { get; }

    public string? BeforeJson { get; }

    public string? AfterJson { get; }

    public string CorrelationId { get; }

    public string Ip { get; }

    public string UserAgent { get; }
}
