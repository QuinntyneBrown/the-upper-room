using TheUpperRoom.Domain.Common;
using TheUpperRoom.Domain.Common.ValueObjects;
using TheUpperRoom.Domain.Locations;

namespace TheUpperRoom.Domain.Tests;

public sealed class LocationTests
{
    private static readonly DateTimeOffset Utc =
        new(2026, 5, 10, 12, 0, 0, TimeSpan.Zero);

    private static Address NewAddress() =>
        new("123 King St", null, "Toronto", "ON", "M5H 1A1", "Canada");

    private static Location NewLocation() =>
        new("city-1", "Hall A", NewAddress(), "creator", Utc);

    [Fact]
    public void Constructor_assigns_required_fields()
    {
        var loc = NewLocation();
        Assert.Equal("Hall A", loc.Name);
        Assert.Equal("Toronto", loc.Address.City);
        Assert.False(loc.Archived);
    }

    [Fact]
    public void Constructor_rejects_blank_name()
    {
        Assert.Throws<DomainException>(() =>
            new Location("city-1", "", NewAddress(), "creator", Utc));
    }

    [Fact]
    public void Update_replaces_basics_and_collections_and_touches_audit()
    {
        var loc = NewLocation();
        var t1 = Utc.AddHours(1);

        loc.Update(
            "Hall B",
            NewAddress(),
            capacity: 200,
            accessibilityNotes: "ramped",
            parkingNotes: "lot at back",
            photoUrls: ["https://cdn.example.com/a.jpg"],
            tagIds: ["tag-1", "tag-1"],
            "editor", t1);

        Assert.Equal("Hall B", loc.Name);
        Assert.Equal(200, loc.Capacity);
        Assert.Equal("ramped", loc.AccessibilityNotes);
        Assert.Single(loc.PhotoUrls);
        Assert.Single(loc.TagIds);
        Assert.Equal("editor", loc.UpdatedBy);
        Assert.Equal(t1, loc.UpdatedAt);
    }

    [Fact]
    public void Update_caps_photo_urls_at_10()
    {
        var loc = NewLocation();
        var elevenUrls = Enumerable.Range(0, 11)
            .Select(i => $"https://cdn.example.com/{i}.jpg");

        Assert.Throws<DomainException>(() => loc.Update(
            "Hall A", NewAddress(), null, null, null,
            elevenUrls, [], "editor", Utc.AddHours(1)));
    }

    [Fact]
    public void Update_rejects_non_http_photo_urls()
    {
        var loc = NewLocation();
        Assert.Throws<DomainException>(() => loc.Update(
            "Hall A", NewAddress(), null, null, null,
            ["javascript:alert(1)"], [], "editor", Utc.AddHours(1)));
    }

    [Fact]
    public void Ensure_can_delete_throws_when_upcoming_events_present()
    {
        var loc = NewLocation();

        var ex = Assert.Throws<DomainException>(() => loc.EnsureCanDelete(3));
        Assert.Contains("3 upcoming events", ex.Message);
    }

    [Fact]
    public void Ensure_can_delete_passes_when_no_upcoming_events()
    {
        var loc = NewLocation();
        loc.EnsureCanDelete(0); // no throw
    }

    [Fact]
    public void Archive_idempotency_and_event_emission()
    {
        var loc = NewLocation();

        loc.Archive("editor", Utc.AddHours(1));
        Assert.True(loc.Archived);
        Assert.IsType<EntityArchivedDomainEvent>(Assert.Single(loc.DomainEvents));

        loc.ClearDomainEvents();
        loc.Archive("editor", Utc.AddHours(2));
        Assert.Empty(loc.DomainEvents);
    }

    [Fact]
    public void Restore_emits_restored_event_only_when_archived()
    {
        var loc = NewLocation();

        loc.Restore("editor", Utc.AddHours(1));
        Assert.Empty(loc.DomainEvents);

        loc.Archive("editor", Utc.AddHours(2));
        loc.ClearDomainEvents();
        loc.Restore("editor", Utc.AddHours(3));

        Assert.False(loc.Archived);
        Assert.IsType<EntityRestoredDomainEvent>(Assert.Single(loc.DomainEvents));
    }
}
