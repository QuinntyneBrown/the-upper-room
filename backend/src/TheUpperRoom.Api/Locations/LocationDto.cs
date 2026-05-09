// traces_to: L2-057, L2-058
namespace TheUpperRoom.Api.Locations;

public sealed record LocationDto(
    string Id,
    string Name,
    string Street,
    string City,
    string State,
    string Country,
    string PostalCode,
    int? Capacity,
    double? Lat,
    double? Lng,
    bool Archived);
