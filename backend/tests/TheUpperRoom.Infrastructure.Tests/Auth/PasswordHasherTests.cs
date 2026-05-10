using TheUpperRoom.Application.Auth;
using TheUpperRoom.Infrastructure.Auth;

namespace TheUpperRoom.Infrastructure.Tests.Auth;

public sealed class PasswordHasherTests
{
    [Fact]
    public void Hash_creates_identity_pbkdf2_hash_that_verifies()
    {
        IPasswordHasher hasher = new PasswordHasher();

        var hash = hasher.Hash("CorrectHorseBatteryStaple!42");

        Assert.NotEqual("CorrectHorseBatteryStaple!42", hash);
        Assert.Equal(
            PasswordHashVerificationResult.Success,
            hasher.Verify("CorrectHorseBatteryStaple!42", hash));
    }

    [Fact]
    public void Verify_rejects_wrong_password_or_blank_hash()
    {
        IPasswordHasher hasher = new PasswordHasher();
        var hash = hasher.Hash("CorrectHorseBatteryStaple!42");

        Assert.Equal(
            PasswordHashVerificationResult.Failed,
            hasher.Verify("wrong", hash));
        Assert.Equal(
            PasswordHashVerificationResult.Failed,
            hasher.Verify("CorrectHorseBatteryStaple!42", ""));
    }
}
