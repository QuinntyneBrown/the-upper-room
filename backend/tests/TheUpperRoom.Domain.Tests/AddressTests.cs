using TheUpperRoom.Domain.Common;
using TheUpperRoom.Domain.Common.ValueObjects;

namespace TheUpperRoom.Domain.Tests;

public sealed class AddressTests
{
    [Fact]
    public void Constructs_with_required_and_optional_fields()
    {
        var address = new Address(
            "1 Main St", "Apt 2", "Toronto", "ON", "M1M 1M1", "Canada",
            latitude: 43.65m, longitude: -79.38m);

        Assert.Equal("1 Main St", address.Street1);
        Assert.Equal("Apt 2", address.Street2);
        Assert.Equal("Toronto", address.City);
        Assert.Equal("ON", address.Region);
        Assert.Equal("M1M 1M1", address.PostalCode);
        Assert.Equal("Canada", address.Country);
        Assert.Equal(43.65m, address.Latitude);
        Assert.Equal(-79.38m, address.Longitude);
    }

    [Fact]
    public void Optional_fields_can_be_null()
    {
        var address = new Address("1 Main St", null, "Toronto", null, null, "Canada");

        Assert.Null(address.Street2);
        Assert.Null(address.Region);
        Assert.Null(address.PostalCode);
        Assert.Null(address.Latitude);
        Assert.Null(address.Longitude);
    }

    [Fact]
    public void Empty_street1_throws()
    {
        Assert.Throws<DomainException>(() =>
            new Address("", null, "Toronto", null, null, "Canada"));
    }

    [Fact]
    public void Empty_city_throws()
    {
        Assert.Throws<DomainException>(() =>
            new Address("1 Main St", null, "", null, null, "Canada"));
    }

    [Fact]
    public void Empty_country_throws()
    {
        Assert.Throws<DomainException>(() =>
            new Address("1 Main St", null, "Toronto", null, null, ""));
    }

    [Theory]
    [InlineData(91)]
    [InlineData(-91)]
    public void Latitude_outside_minus_ninety_to_ninety_throws(decimal lat)
    {
        Assert.Throws<DomainException>(() =>
            new Address("1 Main St", null, "Toronto", null, null, "Canada", latitude: lat));
    }

    [Theory]
    [InlineData(181)]
    [InlineData(-181)]
    public void Longitude_outside_minus_one_eighty_to_one_eighty_throws(decimal lon)
    {
        Assert.Throws<DomainException>(() =>
            new Address("1 Main St", null, "Toronto", null, null, "Canada", longitude: lon));
    }

    [Theory]
    [InlineData(90)]
    [InlineData(-90)]
    [InlineData(0)]
    public void Latitude_at_boundary_is_accepted(decimal lat)
    {
        var address = new Address("1 Main St", null, "Toronto", null, null, "Canada", latitude: lat);

        Assert.Equal(lat, address.Latitude);
    }
}
