using TheUpperRoom.Infrastructure.Locations;

namespace TheUpperRoom.Api.Locations;

internal static class LocationsMapping
{
    public static LocationDto ToDto(this LocationRow row) => new(
        row.Id, row.Name, row.Street, row.City, row.State, row.Country, row.PostalCode,
        row.Capacity, row.Lat, row.Lng, row.Archived, row.Photos, row.EventCount);
}
