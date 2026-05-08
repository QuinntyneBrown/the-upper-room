namespace TheUpperRoom.Domain.Common;

public sealed record EntityArchivedDomainEvent(
    string EntityType,
    string EntityId,
    string ActorUserId,
    DateTimeOffset OccurredAt) : IDomainEvent;
