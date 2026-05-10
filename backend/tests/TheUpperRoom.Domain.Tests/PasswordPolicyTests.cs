using TheUpperRoom.Domain.Auth;

namespace TheUpperRoom.Domain.Tests;

public sealed class PasswordPolicyTests
{
    private readonly PasswordPolicy _policy = new();

    [Fact]
    public void Strong_password_passes_with_full_score()
    {
        var eval = _policy.Evaluate("CorrectHorse1!", "alice@example.com", "Alice Smith");

        Assert.True(eval.IsValid);
        Assert.Equal(5, eval.Score);
        Assert.Null(eval.Helper);
    }

    [Theory]
    [InlineData("password")]
    [InlineData("Password1!")]
    [InlineData("qwerty123")]
    [InlineData("admin")]
    public void Common_password_is_rejected(string common)
    {
        var eval = _policy.Evaluate(common);

        Assert.False(eval.IsValid);
        Assert.Equal(0, eval.Score);
    }

    [Fact]
    public void Compromised_flag_overrides_other_checks()
    {
        // Even an otherwise-strong password fails when knownCompromised is true.
        var eval = _policy.Evaluate("CorrectHorse1!", knownCompromised: true);

        Assert.False(eval.IsValid);
        Assert.Equal(0, eval.Score);
    }

    [Fact]
    public void Password_containing_email_local_part_is_rejected()
    {
        // alice@example.com → local part "alice"
        var eval = _policy.Evaluate("AliceHasOneStrong1!", "alice@example.com", "Bob Smith");

        Assert.False(eval.IsValid);
        Assert.Equal("Password may not contain your email or name.", eval.Helper);
    }

    [Fact]
    public void Password_containing_display_name_part_is_rejected()
    {
        var eval = _policy.Evaluate("RobertHasOneStrong1!", "x@y.com", "Robert Smith");

        Assert.False(eval.IsValid);
        Assert.Equal("Password may not contain your email or name.", eval.Helper);
    }

    [Theory]
    [InlineData("Short!1")]            // < 12 chars
    [InlineData("alllowercase1!42yes")] // no upper
    [InlineData("ALLUPPERCASE1!42YES")] // no lower
    [InlineData("NoDigitsHere!@#$%xx")] // no digit
    [InlineData("NoSymbolHere1234567")] // no symbol
    public void Missing_character_classes_fail(string weak)
    {
        var eval = _policy.Evaluate(weak);

        Assert.False(eval.IsValid);
    }

    [Fact]
    public void Display_name_parts_under_three_chars_are_ignored()
    {
        // "Bo" is < 3 chars; the password contains "Bo" but should still
        // pass the identifier check because the part is too short to count.
        var eval = _policy.Evaluate("BoCorrectHorse1!", "x@y.com", "Bo Smith");

        Assert.True(eval.IsValid);
    }
}
