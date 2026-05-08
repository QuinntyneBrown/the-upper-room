// traces_to: L2-079
namespace TheUpperRoom.Application.Cities;

/// <summary>
/// Marker for any handler/query/command that operates on city-scoped entities.
/// The AuthorizationBehavior injects the caller's CityId and rejects override
/// attempts.
/// </summary>
public interface IRequireCityScope
{
    string? OverrideCityId { get; }
}
