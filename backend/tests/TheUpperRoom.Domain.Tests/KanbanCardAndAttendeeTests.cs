using TheUpperRoom.Domain.Common;
using TheUpperRoom.Domain.Events;
using TheUpperRoom.Domain.Kanban;

namespace TheUpperRoom.Domain.Tests;

public sealed class KanbanCardAndAttendeeTests
{
    private static readonly DateTimeOffset Utc =
        new(2026, 5, 10, 12, 0, 0, TimeSpan.Zero);

    private static KanbanCard NewCard(IReadOnlyDictionary<string, string?>? data = null) =>
        new(
            "board-1",
            "col-1",
            null,
            10m,
            data ?? new Dictionary<string, string?> { ["owner"] = "ada" },
            null,
            ["tag-1"],
            "creator",
            Utc);

    [Fact]
    public void Card_data_uses_case_insensitive_keys()
    {
        var card = NewCard(new Dictionary<string, string?> { ["Owner"] = "ada" });

        Assert.True(card.Data.ContainsKey("owner"));
        Assert.True(card.Data.ContainsKey("OWNER"));
    }

    [Fact]
    public void Card_constructor_dedupes_tag_ids_case_insensitively()
    {
        var card = new KanbanCard(
            "board-1", "col-1", null, 1m,
            new Dictionary<string, string?>(),
            null,
            ["tag-A", "TAG-a", "tag-B"],
            "creator", Utc);

        Assert.Equal(2, card.TagIds.Count);
    }

    [Fact]
    public void Move_updates_column_swimlane_position_and_touches_audit()
    {
        var card = NewCard();
        var t1 = Utc.AddHours(1);

        card.Move("col-2", "swim-A", 25m, "editor", t1);

        Assert.Equal("col-2", card.ColumnId);
        Assert.Equal("swim-A", card.SwimlaneKey);
        Assert.Equal(25m, card.Position);
        Assert.Equal("editor", card.UpdatedBy);
        Assert.Equal(t1, card.UpdatedAt);
    }

    [Fact]
    public void Archive_flips_flag_and_emits_archived_event()
    {
        var card = NewCard();

        card.Archive("editor", Utc.AddHours(1));

        Assert.True(card.Archived);
        Assert.IsType<EntityArchivedDomainEvent>(Assert.Single(card.DomainEvents));
    }

    [Fact]
    public void Card_constructor_rejects_blank_board_or_column()
    {
        Assert.Throws<DomainException>(() => new KanbanCard(
            "", "col-1", null, 1m, new Dictionary<string, string?>(), null, [],
            "creator", Utc));
        Assert.Throws<DomainException>(() => new KanbanCard(
            "board-1", "", null, 1m, new Dictionary<string, string?>(), null, [],
            "creator", Utc));
    }

    [Fact]
    public void Attendee_requires_either_user_or_guest()
    {
        Assert.Throws<DomainException>(() => new EventAttendee(
            "event-1", null, null, RsvpStatus.Yes, Utc, null));
    }

    [Fact]
    public void Attendee_accepts_user_only()
    {
        var attendee = new EventAttendee(
            "event-1", "user-1", null, RsvpStatus.Yes, Utc, "see you there");

        Assert.Equal("user-1", attendee.UserId);
        Assert.Null(attendee.GuestContactId);
        Assert.Equal("see you there", attendee.Note);
    }

    [Fact]
    public void Attendee_accepts_guest_only()
    {
        var attendee = new EventAttendee(
            "event-1", null, "guest-1", RsvpStatus.Maybe, Utc, null);

        Assert.Null(attendee.UserId);
        Assert.Equal("guest-1", attendee.GuestContactId);
    }

    [Fact]
    public void Attendee_update_changes_status_responded_and_note()
    {
        var attendee = new EventAttendee(
            "event-1", "user-1", null, RsvpStatus.Yes, Utc, "first");
        var t1 = Utc.AddHours(2);

        attendee.Update(RsvpStatus.No, t1, "changed mind");

        Assert.Equal(RsvpStatus.No, attendee.Status);
        Assert.Equal(t1, attendee.RespondedAt);
        Assert.Equal("changed mind", attendee.Note);
    }

    [Fact]
    public void Attendee_constructor_rejects_non_utc_responded_at()
    {
        var notUtc = new DateTimeOffset(2026, 5, 10, 0, 0, 0, TimeSpan.FromHours(2));
        Assert.Throws<DomainException>(() => new EventAttendee(
            "event-1", "user-1", null, RsvpStatus.Yes, notUtc, null));
    }
}
