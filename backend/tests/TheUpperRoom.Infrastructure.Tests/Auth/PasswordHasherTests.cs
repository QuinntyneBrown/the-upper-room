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

    [Fact]
    public void Hash_throws_when_plain_password_is_null_or_whitespace()
    {
        IPasswordHasher hasher = new PasswordHasher();

        Assert.Throws<ArgumentNullException>(() => hasher.Hash(null!));
        Assert.Throws<ArgumentException>(() => hasher.Hash(""));
        Assert.Throws<ArgumentException>(() => hasher.Hash("   "));
    }

    [Fact]
    public void Hash_uses_per_call_salt_so_two_hashes_of_same_password_differ()
    {
        IPasswordHasher hasher = new PasswordHasher();

        var hash1 = hasher.Hash("CorrectHorseBatteryStaple!42");
        var hash2 = hasher.Hash("CorrectHorseBatteryStaple!42");

        Assert.NotEqual(hash1, hash2);

        // Both still verify against the original plaintext.
        Assert.Equal(
            PasswordHashVerificationResult.Success,
            hasher.Verify("CorrectHorseBatteryStaple!42", hash1));
        Assert.Equal(
            PasswordHashVerificationResult.Success,
            hasher.Verify("CorrectHorseBatteryStaple!42", hash2));
    }

    [Fact]
    public void Verify_rejects_blank_or_null_plaintext()
    {
        IPasswordHasher hasher = new PasswordHasher();
        var hash = hasher.Hash("CorrectHorseBatteryStaple!42");

        Assert.Equal(PasswordHashVerificationResult.Failed, hasher.Verify(null!, hash));
        Assert.Equal(PasswordHashVerificationResult.Failed, hasher.Verify("", hash));
        Assert.Equal(PasswordHashVerificationResult.Failed, hasher.Verify("   ", hash));
    }
}
