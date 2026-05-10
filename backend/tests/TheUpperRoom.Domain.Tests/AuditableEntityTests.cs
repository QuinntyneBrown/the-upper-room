using TheUpperRoom.Domain.Common;

namespace TheUpperRoom.Domain.Tests;

public sealed class AuditableEntityTests
{
    private static readonly DateTimeOffset Utc =
        new(2026, 5, 10, 12, 0, 0, TimeSpan.Zero);

    [Fact]
    public void Created_and_updated_fields_match_at_construction()
    {
        var entity = new TestEntity("user-1", Utc);

        Assert.Equal("user-1", entity.CreatedBy);
        Assert.Equal(Utc, entity.CreatedAt);
        Assert.Equal("user-1", entity.UpdatedBy);
        Assert.Equal(Utc, entity.UpdatedAt);
    }

    [Fact]
    public void Touch_updates_updated_fields_only()
    {
        var entity = new TestEntity("creator", Utc);
        var later = Utc.AddHours(1);

        entity.TouchPublic("editor", later);

        Assert.Equal("creator", entity.CreatedBy);
        Assert.Equal(Utc, entity.CreatedAt);
        Assert.Equal("editor", entity.UpdatedBy);
        Assert.Equal(later, entity.UpdatedAt);
    }

    [Fact]
    public void Constructor_rejects_non_utc_timestamp()
    {
        var notUtc = new DateTimeOffset(2026, 5, 10, 12, 0, 0, TimeSpan.FromHours(-5));
        Assert.Throws<DomainException>(() => new TestEntity("user-1", notUtc));
    }

    [Fact]
    public void Touch_rejects_non_utc_timestamp()
    {
        var entity = new TestEntity("user-1", Utc);
        var notUtc = new DateTimeOffset(2026, 5, 10, 13, 0, 0, TimeSpan.FromHours(2));
        Assert.Throws<DomainException>(() => entity.TouchPublic("user-2", notUtc));
    }

    [Fact]
    public void Domain_events_start_empty()
    {
        var entity = new TestEntity("user-1", Utc);
        Assert.Empty(entity.DomainEvents);
    }

    [Fact]
    public void Raise_appends_to_domain_events_in_order()
    {
        var entity = new TestEntity("user-1", Utc);
        var first = new TestEvent("a");
        var second = new TestEvent("b");

        entity.RaisePublic(first);
        entity.RaisePublic(second);

        Assert.Collection(entity.DomainEvents,
            e => Assert.Same(first, e),
            e => Assert.Same(second, e));
    }

    [Fact]
    public void Clear_domain_events_empties_the_list()
    {
        var entity = new TestEntity("user-1", Utc);
        entity.RaisePublic(new TestEvent("a"));

        entity.ClearDomainEvents();

        Assert.Empty(entity.DomainEvents);
    }

    [Fact]
    public void Set_version_copies_byte_array_defensively()
    {
        var entity = new TestEntity("user-1", Utc);
        var source = new byte[] { 1, 2, 3 };

        entity.SetVersion(source);
        source[0] = 99;

        Assert.Equal([1, 2, 3], entity.Version);
    }

    [Fact]
    public void Version_is_empty_array_by_default()
    {
        var entity = new TestEntity("user-1", Utc);
        Assert.Empty(entity.Version);
    }

    private sealed class TestEntity(string createdBy, DateTimeOffset createdAt)
        : AuditableEntity(createdBy, createdAt)
    {
        public void TouchPublic(string updatedBy, DateTimeOffset updatedAt)
            => Touch(updatedBy, updatedAt);

        public void RaisePublic(IDomainEvent @event) => Raise(@event);
    }

    private sealed record TestEvent(string Marker) : IDomainEvent
    {
        public DateTimeOffset OccurredAt { get; } = Utc;
    }
}
