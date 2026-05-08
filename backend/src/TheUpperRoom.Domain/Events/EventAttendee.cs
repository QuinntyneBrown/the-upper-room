using TheUpperRoom.Domain.Common;

namespace TheUpperRoom.Domain.Events;

public sealed class EventAttendee : Entity
{
    public EventAttendee(
        string eventId,
        string? userId,
        string? guestContactId,
        RsvpStatus status,
        DateTimeOffset respondedAt,
        string? note,
        string? id = null) : base(id)
    {
        EventId = Guard.Id(eventId, nameof(EventId));
        UserId = Guard.Optional(userId, nameof(UserId), 100);
        GuestContactId = Guard.Optional(guestContactId, nameof(GuestContactId), 100);
        if (UserId is null && GuestContactId is null)
        {
            throw new DomainException("Attendee requires a user or guest contact.");
        }

        Status = status;
        RespondedAt = Guard.Utc(respondedAt, nameof(RespondedAt));
        Note = Guard.Optional(note, nameof(Note), 500);
    }

    public string EventId { get; }

    public string? UserId { get; }

    public string? GuestContactId { get; }

    public RsvpStatus Status { get; private set; }

    public DateTimeOffset RespondedAt { get; private set; }

    public string? Note { get; private set; }

    public void Update(RsvpStatus status, DateTimeOffset respondedAt, string? note)
    {
        Status = status;
        RespondedAt = Guard.Utc(respondedAt, nameof(respondedAt));
        Note = Guard.Optional(note, nameof(note), 500);
    }
}
