using TheUpperRoom.Domain.Common;

namespace TheUpperRoom.Domain.Events;

public sealed class Event : CityScopedAuditableEntity
{
    private readonly List<string> _tagIds = [];
    private readonly List<string> _partnerIds = [];
    private readonly List<EventAttendee> _attendees = [];

    public Event(
        string cityId,
        string title,
        string? descriptionMarkdown,
        DateTimeOffset startsAt,
        DateTimeOffset endsAt,
        string timezone,
        string createdBy,
        DateTimeOffset createdAt,
        string? id = null) : base(cityId, createdBy, createdAt, id)
    {
        Title = Guard.Required(title, nameof(Title), 200);
        DescriptionMarkdown = Guard.Optional(descriptionMarkdown, nameof(DescriptionMarkdown), 10000);
        Timezone = Guard.Required(timezone, nameof(Timezone), 100);
        SetSchedule(startsAt, endsAt);
    }

    public string Title { get; private set; }

    public string? DescriptionMarkdown { get; private set; }

    public EventStatus Status { get; private set; } = EventStatus.Potential;

    public DateTimeOffset StartsAt { get; private set; }

    public DateTimeOffset EndsAt { get; private set; }

    public string Timezone { get; private set; }

    public string? LocationId { get; private set; }

    public string? VirtualMeetingUrl { get; private set; }

    public int? Capacity { get; private set; }

    public bool RequiresApproval { get; private set; }

    public string? CoverImageUrl { get; private set; }

    public IReadOnlyCollection<string> TagIds => _tagIds.AsReadOnly();

    public IReadOnlyCollection<string> PartnerIds => _partnerIds.AsReadOnly();

    public IReadOnlyCollection<EventAttendee> Attendees => _attendees.AsReadOnly();

    public EventStatus GetEffectiveStatus(DateTimeOffset now)
    {
        if (Status == EventStatus.Cancelled)
        {
            return EventStatus.Cancelled;
        }

        return Guard.Utc(now, nameof(now)) > EndsAt ? EventStatus.Past : Status;
    }

    public void Update(
        string title,
        string? descriptionMarkdown,
        DateTimeOffset startsAt,
        DateTimeOffset endsAt,
        string timezone,
        string? locationId,
        string? virtualMeetingUrl,
        int? capacity,
        bool requiresApproval,
        string? coverImageUrl,
        IEnumerable<string> tagIds,
        IEnumerable<string> partnerIds,
        string updatedBy,
        DateTimeOffset updatedAt)
    {
        Title = Guard.Required(title, nameof(Title), 200);
        DescriptionMarkdown = Guard.Optional(descriptionMarkdown, nameof(DescriptionMarkdown), 10000);
        Timezone = Guard.Required(timezone, nameof(Timezone), 100);
        SetSchedule(startsAt, endsAt);
        LocationId = Guard.Optional(locationId, nameof(LocationId), 100);
        VirtualMeetingUrl = Guard.OptionalHttpUrl(virtualMeetingUrl, nameof(VirtualMeetingUrl));
        Capacity = Guard.OptionalRange(capacity, nameof(Capacity), 1, 10000);
        RequiresApproval = requiresApproval;
        CoverImageUrl = Guard.OptionalHttpUrl(coverImageUrl, nameof(CoverImageUrl));
        ReplaceIds(_tagIds, tagIds, "Tag id");
        ReplaceIds(_partnerIds, partnerIds, "Partner id");
        Touch(updatedBy, updatedAt);
    }

    public void ChangeStatus(EventStatus status, string updatedBy, DateTimeOffset updatedAt)
    {
        var oldStatus = Status;
        Status = status;
        Touch(updatedBy, updatedAt);
        Raise(new EntityStatusChangedDomainEvent(
            nameof(Event),
            Id,
            oldStatus.ToString(),
            status.ToString(),
            updatedBy,
            updatedAt));
    }

    public void Cancel(string updatedBy, DateTimeOffset cancelledAt)
    {
        var oldStatus = Status;
        Status = EventStatus.Cancelled;
        Touch(updatedBy, cancelledAt);
        Raise(new EntityStatusChangedDomainEvent(
            nameof(Event),
            Id,
            oldStatus.ToString(),
            Status.ToString(),
            updatedBy,
            cancelledAt));
    }

    public RsvpStatus Rsvp(
        string? userId,
        string? guestContactId,
        RsvpStatus desiredStatus,
        DateTimeOffset respondedAt,
        string? note = null)
    {
        var attendee = FindAttendee(userId, guestContactId);
        var status = ResolveRsvpStatus(attendee, desiredStatus);

        if (attendee is null)
        {
            _attendees.Add(new EventAttendee(Id, userId, guestContactId, status, respondedAt, note));
        }
        else
        {
            attendee.Update(status, respondedAt, note);
        }

        Touch(userId ?? guestContactId!, respondedAt);
        return status;
    }

    private EventAttendee? FindAttendee(string? userId, string? guestContactId)
    {
        if (string.IsNullOrWhiteSpace(userId) && string.IsNullOrWhiteSpace(guestContactId))
        {
            throw new DomainException("RSVP requires a user or guest contact.");
        }

        return _attendees.SingleOrDefault(attendee =>
            (!string.IsNullOrWhiteSpace(userId) && attendee.UserId == userId)
            || (!string.IsNullOrWhiteSpace(guestContactId) && attendee.GuestContactId == guestContactId));
    }

    private RsvpStatus ResolveRsvpStatus(EventAttendee? attendee, RsvpStatus desiredStatus)
    {
        if (desiredStatus != RsvpStatus.Yes)
        {
            return desiredStatus;
        }

        if (RequiresApproval)
        {
            return RsvpStatus.PendingApproval;
        }

        var confirmedCount = _attendees.Count(existing =>
            existing.Status == RsvpStatus.Yes
            && existing.Id != attendee?.Id);

        return Capacity is not null && confirmedCount >= Capacity ? RsvpStatus.Waitlist : RsvpStatus.Yes;
    }

    private void SetSchedule(DateTimeOffset startsAt, DateTimeOffset endsAt)
    {
        StartsAt = Guard.Utc(startsAt, nameof(StartsAt));
        EndsAt = Guard.Utc(endsAt, nameof(EndsAt));
        if (EndsAt <= StartsAt)
        {
            throw new DomainException("End time must be after start time.");
        }
    }

    private static void ReplaceIds(List<string> target, IEnumerable<string> ids, string field)
    {
        target.Clear();
        target.AddRange(ids.Select(id => Guard.Id(id, field)).Distinct(StringComparer.OrdinalIgnoreCase));
    }
}
