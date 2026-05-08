namespace TheUpperRoom.Domain.Common;

public sealed record EntityStatusChangedDomainEvent(
    string EntityType,
    string EntityId,
    string OldStatus,
    string NewStatus,
    string ActorUserId,
    DateTimeOffset OccurredAt) : IDomainEvent;
