using TheUpperRoom.Domain.Common;
using TheUpperRoom.Domain.Common.ValueObjects;

namespace TheUpperRoom.Domain.Tests;

public sealed class PhoneNumberTests
{
    [Fact]
    public void E164_format_constructs_successfully()
    {
        var phone = new PhoneNumber("Mobile", "+15551234567", isPrimary: true);

        Assert.Equal("+15551234567", phone.Number);
        Assert.Equal("Mobile", phone.Label);
        Assert.True(phone.IsPrimary);
    }

    [Theory]
    [InlineData("5551234567")]    // missing leading +
    [InlineData("+0123456789")]   // leading + then 0 — invalid country code
    [InlineData("not-a-number")]  // junk
    [InlineData("+")]             // just the +
    public void Non_e164_inputs_throw(string bad)
    {
        Assert.Throws<DomainException>(() => new PhoneNumber("Mobile", bad));
    }

    [Fact]
    public void Empty_label_throws()
    {
        Assert.Throws<DomainException>(() => new PhoneNumber("", "+15551234567"));
    }

    [Fact]
    public void Default_is_primary_is_false()
    {
        var phone = new PhoneNumber("Mobile", "+15551234567");

        Assert.False(phone.IsPrimary);
    }
}
