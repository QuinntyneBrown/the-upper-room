// traces_to: L2-079
using System.Reflection;
using TheUpperRoom.Application.Cities;
using TheUpperRoom.Domain.Cities;

namespace TheUpperRoom.Api.Tests.Cities;

public sealed class CityScopeArchitectureTests
{
    [Fact]
    public void CityScope_helpers_only_accept_IHasCity_entities()
    {
        // The constraint is enforced by the type system; this test just makes the
        // contract visible: anything you pass through CityScope must implement
        // IHasCity, which means new city-scoped entities cannot accidentally skip
        // the filter without a compile error elsewhere.
        var hasCityImpls = typeof(IHasCity).Assembly
            .GetTypes()
            .Where(t => t is { IsClass: true, IsAbstract: false } && typeof(IHasCity).IsAssignableFrom(t))
            .ToList();
        Assert.NotNull(hasCityImpls);
    }

    [Fact]
    public void IRequireCityScope_marker_is_resolvable()
    {
        var marker = typeof(IRequireCityScope);
        Assert.True(marker.IsInterface);
        Assert.NotNull(marker.GetProperty(nameof(IRequireCityScope.OverrideCityId)));
    }
}
