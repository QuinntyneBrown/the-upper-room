using TheUpperRoom.Domain.Common;
using TheUpperRoom.Domain.Common.ValueObjects;

namespace TheUpperRoom.Domain.Tests;

public sealed class EmailAddressTests
{
    [Fact]
    public void Constructs_with_normalised_lowercase_address()
    {
        var email = new EmailAddress("Work", "Alice@Example.COM");

        Assert.Equal("alice@example.com", email.Address);
        Assert.Equal("Work", email.Label);
        Assert.False(email.IsPrimary);
    }

    [Fact]
    public void Is_primary_flag_is_remembered()
    {
        var email = new EmailAddress("Work", "alice@example.com", isPrimary: true);

        Assert.True(email.IsPrimary);
    }

    [Theory]
    [InlineData("not-an-email")]
    [InlineData("@example.com")]
    [InlineData("user@")]
    public void Invalid_address_format_throws_domain_exception(string bad)
    {
        // System.Net.Mail.MailAddress is lenient about TLD presence — it
        // accepts "user@host" without a dot — so the rejected forms here
        // are limited to those it actually flags.
        Assert.Throws<DomainException>(() => new EmailAddress("Work", bad));
    }

    [Fact]
    public void Empty_label_throws_domain_exception()
    {
        Assert.Throws<DomainException>(() => new EmailAddress("", "alice@example.com"));
    }

    [Fact]
    public void Address_too_long_throws_domain_exception()
    {
        // Address column is bounded at 254 chars; the local-part-only
        // here keeps it large enough to trip the length guard.
        var oversized = new string('a', 255) + "@example.com";

        Assert.Throws<DomainException>(() => new EmailAddress("Work", oversized));
    }

    [Fact]
    public void Records_with_same_address_label_and_primary_are_equal()
    {
        var a = new EmailAddress("Work", "alice@example.com");
        var b = new EmailAddress("Work", "ALICE@example.com");

        Assert.Equal(a, b);
    }
}
