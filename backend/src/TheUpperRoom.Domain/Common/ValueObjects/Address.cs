using TheUpperRoom.Domain.Common;

namespace TheUpperRoom.Domain.Common.ValueObjects;

public sealed record Address
{
    public Address(
        string street1,
        string? street2,
        string city,
        string? region,
        string? postalCode,
        string country,
        decimal? latitude = null,
        decimal? longitude = null)
    {
        Street1 = Guard.Required(street1, nameof(Street1), 200);
        Street2 = Guard.Optional(street2, nameof(Street2), 200);
        City = Guard.Required(city, nameof(City), 100);
        Region = Guard.Optional(region, nameof(Region), 100);
        PostalCode = Guard.Optional(postalCode, nameof(PostalCode), 30);
        Country = Guard.Required(country, nameof(Country), 100);

        if (latitude is < -90 or > 90)
        {
            throw new DomainException("Latitude must be between -90 and 90.");
        }

        if (longitude is < -180 or > 180)
        {
            throw new DomainException("Longitude must be between -180 and 180.");
        }

        Latitude = latitude;
        Longitude = longitude;
    }

    public string Street1 { get; }

    public string? Street2 { get; }

    public string City { get; }

    public string? Region { get; }

    public string? PostalCode { get; }

    public string Country { get; }

    public decimal? Latitude { get; }

    public decimal? Longitude { get; }
}
