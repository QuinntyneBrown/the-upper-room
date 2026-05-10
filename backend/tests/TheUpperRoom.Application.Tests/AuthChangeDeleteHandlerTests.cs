using MediatR;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Application.Auth;

namespace TheUpperRoom.Application.Tests;

// ChangePassword and DeleteAccount share an identical guard prelude:
// (1) FindById; missing or no-PasswordHash -> NotFound, (2) verify
// current password; failure -> InvalidCredentials. Then ChangePassword
// rehashes, DeleteAccount calls DeleteAccountAsync (which can itself
// return false -> NotFound, e.g. concurrent deletion).
public sealed class AuthChangeDeleteHandlerTests
{
    private static (ISender, ScriptableStore) NewSender(
        ScriptableStore store,
        PasswordHashVerificationResult verifyResult)
    {
        var services = new ServiceCollection();
        services.AddSingleton<IAuthUserStore>(store);
        services.AddSingleton<IPasswordHasher>(new VerifyResultHasher(verifyResult));
        services.AddSingleton<IAuthEmailSender>(new NoOpMailer());
        services.AddApplication();
        return (services.BuildServiceProvider().GetRequiredService<ISender>(), store);
    }

    [Fact]
    public async Task ChangePassword_returns_NotFound_when_user_missing()
    {
        var (sender, _) = NewSender(new ScriptableStore { User = null }, PasswordHashVerificationResult.Success);

        var result = await sender.Send(new ChangePasswordCommand(
            "user-1", "Current!Password!42", "NewCorrectHorseBattery!42"));

        Assert.Equal(AuthMutationOutcome.NotFound, result.Outcome);
    }

    [Fact]
    public async Task ChangePassword_returns_NotFound_when_user_has_no_password_hash()
    {
        var (sender, _) = NewSender(
            new ScriptableStore { User = new AuthUser("user-1", "ada@example.com", null, true) },
            PasswordHashVerificationResult.Success);

        var result = await sender.Send(new ChangePasswordCommand(
            "user-1", "Current!Password!42", "NewCorrectHorseBattery!42"));

        Assert.Equal(AuthMutationOutcome.NotFound, result.Outcome);
    }

    [Fact]
    public async Task ChangePassword_returns_InvalidCredentials_when_verify_fails()
    {
        var (sender, _) = NewSender(
            new ScriptableStore { User = new AuthUser("user-1", "ada@example.com", "stored", true) },
            PasswordHashVerificationResult.Failed);

        var result = await sender.Send(new ChangePasswordCommand(
            "user-1", "wrong-current!42", "NewCorrectHorseBattery!42"));

        Assert.Equal(AuthMutationOutcome.InvalidCredentials, result.Outcome);
    }

    [Fact]
    public async Task ChangePassword_returns_Success_and_rehashes_on_happy_path()
    {
        var (sender, store) = NewSender(
            new ScriptableStore { User = new AuthUser("user-1", "ada@example.com", "stored", true) },
            PasswordHashVerificationResult.Success);

        var result = await sender.Send(new ChangePasswordCommand(
            "user-1", "Current!Password!42", "NewCorrectHorseBattery!42"));

        Assert.Equal(AuthMutationOutcome.Success, result.Outcome);
        Assert.Equal(1, store.PasswordRehashes);
        Assert.StartsWith("hash::", store.LastNewPasswordHash);
    }

    [Fact]
    public async Task DeleteAccount_returns_NotFound_when_user_missing()
    {
        var (sender, _) = NewSender(new ScriptableStore { User = null }, PasswordHashVerificationResult.Success);

        var result = await sender.Send(new DeleteAccountCommand("user-1", "Current!Password!42"));

        Assert.Equal(AuthMutationOutcome.NotFound, result.Outcome);
    }

    [Fact]
    public async Task DeleteAccount_returns_InvalidCredentials_when_verify_fails()
    {
        var (sender, _) = NewSender(
            new ScriptableStore { User = new AuthUser("user-1", "ada@example.com", "stored", true) },
            PasswordHashVerificationResult.Failed);

        var result = await sender.Send(new DeleteAccountCommand("user-1", "wrong!42"));

        Assert.Equal(AuthMutationOutcome.InvalidCredentials, result.Outcome);
    }

    [Fact]
    public async Task DeleteAccount_returns_NotFound_when_store_returns_false_after_verify()
    {
        // Concurrent deletion: verify passes but the actual delete races.
        var (sender, _) = NewSender(
            new ScriptableStore
            {
                User = new AuthUser("user-1", "ada@example.com", "stored", true),
                DeleteAccountReturns = false,
            },
            PasswordHashVerificationResult.Success);

        var result = await sender.Send(new DeleteAccountCommand("user-1", "Current!Password!42"));

        Assert.Equal(AuthMutationOutcome.NotFound, result.Outcome);
    }

    [Fact]
    public async Task DeleteAccount_returns_Success_when_store_confirms_delete()
    {
        var (sender, store) = NewSender(
            new ScriptableStore
            {
                User = new AuthUser("user-1", "ada@example.com", "stored", true),
                DeleteAccountReturns = true,
            },
            PasswordHashVerificationResult.Success);

        var result = await sender.Send(new DeleteAccountCommand("user-1", "Current!Password!42"));

        Assert.Equal(AuthMutationOutcome.Success, result.Outcome);
        Assert.Equal(1, store.DeletesAttempted);
    }

    private sealed class ScriptableStore : IAuthUserStore
    {
        public AuthUser? User { get; init; }
        public bool DeleteAccountReturns { get; init; }
        public int PasswordRehashes { get; private set; }
        public int DeletesAttempted { get; private set; }
        public string? LastNewPasswordHash { get; private set; }

        public Task<AuthUser?> FindByIdAsync(string userId, CancellationToken cancellationToken = default) =>
            Task.FromResult(User);
        public Task ReplacePasswordHashAsync(string userId, string passwordHash, DateTimeOffset updatedAt, CancellationToken cancellationToken = default)
        {
            PasswordRehashes++;
            LastNewPasswordHash = passwordHash;
            return Task.CompletedTask;
        }
        public Task<bool> DeleteAccountAsync(string userId, DateTimeOffset deletedAt, CancellationToken cancellationToken = default)
        {
            DeletesAttempted++;
            return Task.FromResult(DeleteAccountReturns);
        }

        public Task<AuthUser?> FindByEmailAsync(string email, CancellationToken cancellationToken = default) =>
            Task.FromResult<AuthUser?>(null);
        public Task<string?> CreatePasswordUserAsync(string email, string passwordHash, string city, string role, string emailVerificationTokenHash, DateTimeOffset now, CancellationToken cancellationToken = default) =>
            Task.FromResult<string?>(null);
        public Task<bool> SetPasswordResetTokenAsync(string email, string tokenHash, DateTimeOffset expiresUtc, DateTimeOffset updatedAt, CancellationToken cancellationToken = default) =>
            Task.FromResult(false);
        public Task<bool> ResetPasswordAsync(string tokenHash, string passwordHash, DateTimeOffset updatedAt, CancellationToken cancellationToken = default) =>
            Task.FromResult(false);
        public Task<bool> VerifyEmailAsync(string tokenHash, DateTimeOffset verifiedAt, CancellationToken cancellationToken = default) =>
            Task.FromResult(false);
        public Task RecordSuccessfulSignInAsync(string userId, DateTimeOffset signedInAt, CancellationToken cancellationToken = default) =>
            Task.CompletedTask;
    }

    private sealed class VerifyResultHasher(PasswordHashVerificationResult result) : IPasswordHasher
    {
        public string Hash(string plain) => "hash::" + plain;
        public PasswordHashVerificationResult Verify(string plain, string hash) => result;
    }

    private sealed class NoOpMailer : IAuthEmailSender
    {
        public Task SendEmailVerificationAsync(string email, string token, CancellationToken cancellationToken = default) =>
            Task.CompletedTask;
        public Task SendPasswordResetAsync(string email, string token, CancellationToken cancellationToken = default) =>
            Task.CompletedTask;
    }
}
