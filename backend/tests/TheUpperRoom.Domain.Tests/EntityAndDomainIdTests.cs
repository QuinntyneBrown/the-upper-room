using TheUpperRoom.Domain.Common;

namespace TheUpperRoom.Domain.Tests;

public sealed class EntityAndDomainIdTests
{
    [Fact]
    public void DomainId_New_returns_uuid_v7_format()
    {
        var id = DomainId.New();

        // Parse-able as Guid and version nibble == 7.
        var guid = Guid.Parse(id);
        Assert.Equal(7, (guid.ToByteArray()[7] & 0xF0) >> 4);
    }

    [Fact]
    public void DomainId_New_is_unique_across_calls()
    {
        var ids = Enumerable.Range(0, 50).Select(_ => DomainId.New()).ToHashSet();
        Assert.Equal(50, ids.Count);
    }

    [Fact]
    public void Entity_assigns_new_id_when_constructor_id_is_null()
    {
        var entity = new TestEntity(null);
        Assert.False(string.IsNullOrWhiteSpace(entity.Id));
        Assert.True(Guid.TryParse(entity.Id, out _));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Entity_assigns_new_id_when_constructor_id_is_blank(string id)
    {
        var entity = new TestEntity(id);
        Assert.False(string.IsNullOrWhiteSpace(entity.Id));
        Assert.True(Guid.TryParse(entity.Id, out _));
    }

    [Fact]
    public void Entity_preserves_explicit_id_trimmed()
    {
        var entity = new TestEntity("  custom-id  ");
        Assert.Equal("custom-id", entity.Id);
    }

    [Fact]
    public void Entity_preserves_explicit_id_unchanged_when_no_whitespace()
    {
        var entity = new TestEntity("custom-id");
        Assert.Equal("custom-id", entity.Id);
    }

    private sealed class TestEntity(string? id) : Entity(id);
}
