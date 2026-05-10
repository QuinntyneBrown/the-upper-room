using TheUpperRoom.Application.Cities;
using TheUpperRoom.Domain.Cities;

namespace TheUpperRoom.Application.Tests;

public sealed class CityScopeTests
{
    private sealed class Tagged : IHasCity
    {
        public string CityId { get; init; } = "";
        public string Tag { get; init; } = "";
    }

    [Fact]
    public void For_city_filters_to_matching_city_id()
    {
        var items = new[]
        {
            new Tagged { CityId = "Toronto", Tag = "a" },
            new Tagged { CityId = "Halifax", Tag = "b" },
            new Tagged { CityId = "Toronto", Tag = "c" },
        };

        var filtered = CityScope.ForCity(items, "Toronto").ToArray();

        Assert.Equal(2, filtered.Length);
        Assert.All(filtered, t => Assert.Equal("Toronto", t.CityId));
    }

    [Fact]
    public void For_city_with_no_match_returns_empty()
    {
        var items = new[] { new Tagged { CityId = "Toronto", Tag = "a" } };

        Assert.Empty(CityScope.ForCity(items, "Halifax"));
    }

    [Fact]
    public void Visible_or_null_returns_entity_when_city_matches()
    {
        var entity = new Tagged { CityId = "Toronto", Tag = "a" };

        Assert.Same(entity, CityScope.VisibleOrNull(entity, "Toronto"));
    }

    [Fact]
    public void Visible_or_null_returns_null_when_city_differs()
    {
        var entity = new Tagged { CityId = "Toronto", Tag = "a" };

        Assert.Null(CityScope.VisibleOrNull(entity, "Halifax"));
    }

    [Fact]
    public void Visible_or_null_returns_null_when_entity_is_null()
    {
        Assert.Null(CityScope.VisibleOrNull<Tagged>(null, "Toronto"));
    }
}
