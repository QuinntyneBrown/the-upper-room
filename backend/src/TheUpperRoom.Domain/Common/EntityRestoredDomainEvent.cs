namespace TheUpperRoom.Domain.Common;

public sealed record EntityRestoredDomainEvent(
    string EntityType,
    string EntityId,
    string ActorUserId,
    DateTimeOffset OccurredAt) : IDomainEvent;
