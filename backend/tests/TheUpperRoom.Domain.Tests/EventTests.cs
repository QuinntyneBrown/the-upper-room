using TheUpperRoom.Domain.Common;
using TheUpperRoom.Domain.Events;

namespace TheUpperRoom.Domain.Tests;

public sealed class EventTests
{
    private static readonly DateTimeOffset Utc =
        new(2026, 5, 10, 12, 0, 0, TimeSpan.Zero);

    private static readonly DateTimeOffset Starts = Utc.AddDays(7);
    private static readonly DateTimeOffset Ends = Utc.AddDays(7).AddHours(2);

    private static Event NewEvent(int? capacity = null, bool requiresApproval = false)
    {
        var evt = new Event(
            "city-1",
            "Sunday Service",
            null,
            Starts,
            Ends,
            "America/Toronto",
            "creator",
            Utc);
        if (capacity is not null || requiresApproval)
        {
            evt.Update(
                "Sunday Service",
                null,
                Starts,
                Ends,
                "America/Toronto",
                null,
                null,
                capacity,
                requiresApproval,
                null,
                [],
                [],
                "creator",
                Utc.AddSeconds(1));
        }
        return evt;
    }

    [Fact]
    public void Status_defaults_to_Potential()
    {
        Assert.Equal(EventStatus.Potential, NewEvent().Status);
    }

    [Fact]
    public void End_time_must_be_after_start_time()
    {
        Assert.Throws<DomainException>(() => new Event(
            "city-1", "t", null, Starts, Starts, "America/Toronto", "creator", Utc));
        Assert.Throws<DomainException>(() => new Event(
            "city-1", "t", null, Starts, Starts.AddHours(-1), "America/Toronto", "creator", Utc));
    }

    [Fact]
    public void Get_effective_status_returns_Past_when_now_is_after_end()
    {
        var evt = NewEvent();
        Assert.Equal(EventStatus.Past, evt.GetEffectiveStatus(Ends.AddSeconds(1)));
    }

    [Fact]
    public void Get_effective_status_returns_Cancelled_even_when_past()
    {
        var evt = NewEvent();
        evt.Cancel("editor", Utc.AddDays(1));
        Assert.Equal(EventStatus.Cancelled, evt.GetEffectiveStatus(Ends.AddDays(30)));
    }

    [Fact]
    public void Cancel_emits_status_change_event()
    {
        var evt = NewEvent();
        evt.Cancel("editor", Utc.AddDays(1));

        var status = Assert.IsType<EntityStatusChangedDomainEvent>(Assert.Single(evt.DomainEvents));
        Assert.Equal("Potential", status.OldStatus);
        Assert.Equal("Cancelled", status.NewStatus);
    }

    [Fact]
    public void Rsvp_yes_without_approval_or_capacity_is_confirmed()
    {
        var evt = NewEvent();

        var status = evt.Rsvp("user-1", null, RsvpStatus.Yes, Utc.AddHours(1));

        Assert.Equal(RsvpStatus.Yes, status);
        Assert.Single(evt.Attendees);
    }

    [Fact]
    public void Rsvp_yes_with_requires_approval_returns_PendingApproval()
    {
        var evt = NewEvent(requiresApproval: true);

        var status = evt.Rsvp("user-1", null, RsvpStatus.Yes, Utc.AddHours(1));

        Assert.Equal(RsvpStatus.PendingApproval, status);
    }

    [Fact]
    public void Rsvp_yes_when_at_capacity_returns_Waitlist()
    {
        var evt = NewEvent(capacity: 1);
        evt.Rsvp("user-1", null, RsvpStatus.Yes, Utc.AddHours(1));

        var status = evt.Rsvp("user-2", null, RsvpStatus.Yes, Utc.AddHours(2));

        Assert.Equal(RsvpStatus.Waitlist, status);
    }

    [Fact]
    public void Rsvp_no_or_maybe_passes_through_unchanged()
    {
        var evt = NewEvent(capacity: 1, requiresApproval: true);

        Assert.Equal(RsvpStatus.No,
            evt.Rsvp("user-1", null, RsvpStatus.No, Utc.AddHours(1)));
        Assert.Equal(RsvpStatus.Maybe,
            evt.Rsvp("user-2", null, RsvpStatus.Maybe, Utc.AddHours(2)));
    }

    [Fact]
    public void Rsvp_updates_existing_attendee_when_user_changes_response()
    {
        var evt = NewEvent();
        evt.Rsvp("user-1", null, RsvpStatus.Yes, Utc.AddHours(1));

        evt.Rsvp("user-1", null, RsvpStatus.No, Utc.AddHours(2));

        Assert.Single(evt.Attendees);
        Assert.Equal(RsvpStatus.No, evt.Attendees.Single().Status);
    }

    [Fact]
    public void Rsvp_throws_when_neither_user_nor_guest_provided()
    {
        var evt = NewEvent();
        Assert.Throws<DomainException>(() =>
            evt.Rsvp(null, null, RsvpStatus.Yes, Utc.AddHours(1)));
    }
}
