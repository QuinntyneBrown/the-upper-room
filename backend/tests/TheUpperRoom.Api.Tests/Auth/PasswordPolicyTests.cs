// traces_to: L2-019
using TheUpperRoom.Api.Auth;

namespace TheUpperRoom.Api.Tests.Auth;

public sealed class PasswordPolicyTests
{
    private readonly PasswordPolicy _policy = new();

    [Theory]
    [InlineData("Password1!", "common")]
    [InlineData("aaaaaaaaaaaa", "rules")]
    [InlineData("AliceSecret!23", "personal")]
    public void Rejects_weak_or_personal_passwords(string pwd, string reason)
    {
        var result = _policy.Evaluate(pwd, "alice@example.com");
        Assert.False(result.IsValid, $"expected invalid for reason: {reason}");
    }

    [Fact]
    public void Accepts_a_strong_password_unrelated_to_user()
    {
        var result = _policy.Evaluate("Tr0ub4dor&3-Solid", "alice@example.com");
        Assert.True(result.IsValid);
        Assert.Equal(5, result.Score);
    }
}
