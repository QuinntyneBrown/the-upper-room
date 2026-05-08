namespace TheUpperRoom.Domain.Common;

public sealed record EntityDeletedDomainEvent(
    string EntityType,
    string EntityId,
    string ActorUserId,
    DateTimeOffset OccurredAt) : IDomainEvent;
