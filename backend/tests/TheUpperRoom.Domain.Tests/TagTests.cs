using TheUpperRoom.Domain.Common;
using TheUpperRoom.Domain.Tags;

namespace TheUpperRoom.Domain.Tests;

public sealed class TagTests
{
    private static readonly DateTimeOffset Utc =
        new(2026, 5, 10, 12, 0, 0, TimeSpan.Zero);

    private static Tag NewTag(
        string name = "Volunteer",
        string? description = null,
        TagColor color = TagColor.Blue) =>
        new("city-1", name, color, description, "creator", Utc);

    [Fact]
    public void Constructor_assigns_name_color_description_and_derived_slug()
    {
        var tag = NewTag("Mission Trip", "for travel volunteers", TagColor.Green);

        Assert.Equal("Mission Trip", tag.Name);
        Assert.Equal("mission-trip", tag.Slug);
        Assert.Equal(TagColor.Green, tag.Color);
        Assert.Equal("for travel volunteers", tag.Description);
        Assert.Equal("city-1", tag.CityId);
    }

    [Fact]
    public void Description_can_be_null()
    {
        var tag = NewTag(description: null);
        Assert.Null(tag.Description);
    }

    [Fact]
    public void Update_replaces_name_slug_color_and_description_and_touches_audit()
    {
        var tag = NewTag("Old Name", "old desc", TagColor.Red);
        var t1 = Utc.AddDays(1);

        tag.Update("New Name", TagColor.Purple, "new desc", "editor", t1);

        Assert.Equal("New Name", tag.Name);
        Assert.Equal("new-name", tag.Slug);
        Assert.Equal(TagColor.Purple, tag.Color);
        Assert.Equal("new desc", tag.Description);
        Assert.Equal("editor", tag.UpdatedBy);
        Assert.Equal(t1, tag.UpdatedAt);
    }

    [Fact]
    public void Update_can_clear_description_with_null()
    {
        var tag = NewTag(description: "had a desc");

        tag.Update("Volunteer", TagColor.Blue, null, "editor", Utc.AddHours(1));

        Assert.Null(tag.Description);
    }

    [Fact]
    public void Constructor_rejects_blank_name()
    {
        Assert.Throws<DomainException>(() => NewTag(name: ""));
    }

    [Fact]
    public void Constructor_rejects_name_over_50_chars()
    {
        Assert.Throws<DomainException>(() => NewTag(name: new string('a', 51)));
    }

    [Fact]
    public void Constructor_rejects_description_over_200_chars()
    {
        Assert.Throws<DomainException>(() => NewTag(description: new string('a', 201)));
    }
}
