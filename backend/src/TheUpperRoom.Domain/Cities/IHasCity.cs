// traces_to: L2-079
namespace TheUpperRoom.Domain.Cities;

/// <summary>
/// Marker for any entity that lives within a single city's scope.
/// </summary>
public interface IHasCity
{
    string CityId { get; }
}
