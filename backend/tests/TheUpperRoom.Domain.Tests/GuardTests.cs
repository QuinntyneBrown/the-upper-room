using TheUpperRoom.Domain.Common;

namespace TheUpperRoom.Domain.Tests;

public sealed class GuardTests
{
    [Fact]
    public void Required_returns_trimmed_value()
    {
        Assert.Equal("Alice", Guard.Required("  Alice  ", "Name", 100));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Required_throws_when_blank(string? input)
    {
        Assert.Throws<DomainException>(() => Guard.Required(input, "Name", 100));
    }

    [Fact]
    public void Required_throws_when_below_min_length()
    {
        Assert.Throws<DomainException>(() => Guard.Required("a", "Name", 100, minLength: 2));
    }

    [Fact]
    public void Required_throws_when_above_max_length()
    {
        Assert.Throws<DomainException>(() => Guard.Required(new string('a', 101), "Name", 100));
    }

    [Fact]
    public void Optional_returns_null_for_blank_input()
    {
        Assert.Null(Guard.Optional("   ", "Field", 100));
        Assert.Null(Guard.Optional(null, "Field", 100));
    }

    [Fact]
    public void Optional_returns_trimmed_value_when_present()
    {
        Assert.Equal("trimmed", Guard.Optional("  trimmed  ", "Field", 100));
    }

    [Fact]
    public void Optional_throws_when_above_max_length()
    {
        Assert.Throws<DomainException>(() => Guard.Optional(new string('a', 101), "Field", 100));
    }

    [Fact]
    public void Utc_returns_value_when_offset_is_zero()
    {
        var utc = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);
        Assert.Equal(utc, Guard.Utc(utc, "When"));
    }

    [Fact]
    public void Utc_throws_when_offset_is_non_zero()
    {
        var notUtc = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.FromHours(-5));
        Assert.Throws<DomainException>(() => Guard.Utc(notUtc, "When"));
    }

    [Theory]
    [InlineData("https://example.com/")]
    [InlineData("http://example.com/path?q=1")]
    public void Required_http_url_accepts_http_or_https(string url)
    {
        Assert.Equal(url, Guard.RequiredHttpUrl(url, "Url"));
    }

    [Theory]
    [InlineData("ftp://example.com/")]
    [InlineData("javascript:alert(1)")]
    [InlineData("not-a-url")]
    [InlineData("//example.com/")]
    public void Required_http_url_rejects_non_http_schemes(string url)
    {
        Assert.Throws<DomainException>(() => Guard.RequiredHttpUrl(url, "Url"));
    }

    [Fact]
    public void Optional_http_url_returns_null_for_blank()
    {
        Assert.Null(Guard.OptionalHttpUrl(null, "Url"));
        Assert.Null(Guard.OptionalHttpUrl("   ", "Url"));
    }

    [Fact]
    public void Optional_range_returns_null_for_null()
    {
        Assert.Null(Guard.OptionalRange(null, "Capacity", 1, 100));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(101)]
    public void Optional_range_throws_outside_bounds(int value)
    {
        Assert.Throws<DomainException>(() => Guard.OptionalRange(value, "Capacity", 1, 100));
    }
}
