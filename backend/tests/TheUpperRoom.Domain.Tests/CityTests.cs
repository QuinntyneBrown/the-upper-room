using TheUpperRoom.Domain.Cities;
using TheUpperRoom.Domain.Common;

namespace TheUpperRoom.Domain.Tests;

public sealed class CityTests
{
    private static readonly DateTimeOffset Utc =
        new(2026, 5, 10, 12, 0, 0, TimeSpan.Zero);

    private static City NewCity() =>
        new("Toronto", "Canada", "creator", Utc);

    [Fact]
    public void Constructor_assigns_name_country_and_derived_slug()
    {
        var city = new City("New York City", "USA", "creator", Utc);

        Assert.Equal("New York City", city.Name);
        Assert.Equal("USA", city.Country);
        Assert.Equal("new-york-city", city.Slug);
        Assert.False(city.Archived);
    }

    [Fact]
    public void Rename_updates_name_slug_and_audit_fields()
    {
        var city = NewCity();
        var later = Utc.AddDays(1);

        city.Rename("Greater Toronto", "editor", later);

        Assert.Equal("Greater Toronto", city.Name);
        Assert.Equal("greater-toronto", city.Slug);
        Assert.Equal("editor", city.UpdatedBy);
        Assert.Equal(later, city.UpdatedAt);
        // Created* unchanged.
        Assert.Equal("creator", city.CreatedBy);
        Assert.Equal(Utc, city.CreatedAt);
    }

    [Fact]
    public void Archive_flips_flag_and_raises_archived_event()
    {
        var city = NewCity();

        city.Archive("editor", Utc.AddHours(1));

        Assert.True(city.Archived);
        var evt = Assert.Single(city.DomainEvents);
        var archived = Assert.IsType<EntityArchivedDomainEvent>(evt);
        Assert.Equal(nameof(City), archived.EntityType);
        Assert.Equal(city.Id, archived.EntityId);
        Assert.Equal("editor", archived.ActorUserId);
    }

    [Fact]
    public void Archive_when_already_archived_is_idempotent()
    {
        var city = NewCity();
        city.Archive("editor", Utc.AddHours(1));
        city.ClearDomainEvents();

        city.Archive("editor2", Utc.AddHours(2));

        Assert.True(city.Archived);
        Assert.Empty(city.DomainEvents);
        // UpdatedBy/At should NOT have changed on the no-op call.
        Assert.Equal("editor", city.UpdatedBy);
    }

    [Fact]
    public void Restore_after_archive_clears_flag_and_raises_restored_event()
    {
        var city = NewCity();
        city.Archive("editor", Utc.AddHours(1));
        city.ClearDomainEvents();

        city.Restore("editor", Utc.AddHours(2));

        Assert.False(city.Archived);
        Assert.IsType<EntityRestoredDomainEvent>(Assert.Single(city.DomainEvents));
    }

    [Fact]
    public void Restore_when_not_archived_is_idempotent()
    {
        var city = NewCity();

        city.Restore("editor", Utc.AddHours(1));

        Assert.False(city.Archived);
        Assert.Empty(city.DomainEvents);
    }

    [Fact]
    public void Constructor_rejects_blank_name()
    {
        Assert.Throws<DomainException>(
            () => new City("", "Canada", "creator", Utc));
    }

    [Fact]
    public void Constructor_rejects_blank_country()
    {
        Assert.Throws<DomainException>(
            () => new City("Toronto", "", "creator", Utc));
    }
}
