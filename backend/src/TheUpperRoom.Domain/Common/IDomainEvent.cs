namespace TheUpperRoom.Domain.Common;

public interface IDomainEvent
{
    DateTimeOffset OccurredAt { get; }
}
