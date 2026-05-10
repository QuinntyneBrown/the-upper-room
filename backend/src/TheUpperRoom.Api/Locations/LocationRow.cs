namespace TheUpperRoom.Api.Locations;

public sealed class LocationRow
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = "";
    public string Street { get; set; } = "";
    public string City { get; set; } = "";
    public string State { get; set; } = "";
    public string Country { get; set; } = "";
    public string PostalCode { get; set; } = "";
    public int? Capacity { get; set; }
    public double? Lat { get; set; }
    public double? Lng { get; set; }
    public bool Archived { get; set; }
    public string[] Photos { get; set; } = Array.Empty<string>();
    public int EventCount { get; set; }

    public LocationDto ToDto() => new(Id, Name, Street, City, State, Country, PostalCode,
        Capacity, Lat, Lng, Archived, Photos, EventCount);
}
