using MediatR;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Application.Auth;

namespace TheUpperRoom.Application.Tests;

// Sweeps the smaller token-driven Auth handlers: VerifyEmail,
// RequestPasswordReset, ResetPassword. Each hashes the plaintext
// token before talking to the store -- pinning that contract.
public sealed class AuthVerifyResetHandlerTests
{
    private static (ISender Sender, ScriptableStore Store, CountingMailer Mailer) NewSender(
        ScriptableStore store)
    {
        var services = new ServiceCollection();
        var mailer = new CountingMailer();
        services.AddSingleton<IAuthUserStore>(store);
        services.AddSingleton<IPasswordHasher>(new PrefixHasher());
        services.AddSingleton<IAuthEmailSender>(mailer);
        services.AddApplication();
        return (services.BuildServiceProvider().GetRequiredService<ISender>(), store, mailer);
    }

    [Fact]
    public async Task VerifyEmail_returns_Success_when_store_confirms_match()
    {
        var (sender, store, _) = NewSender(new ScriptableStore { VerifyEmailReturns = true });

        var result = await sender.Send(new VerifyEmailCommand("plain-token-abc"));

        Assert.Equal(AuthMutationOutcome.Success, result.Outcome);
        // Store must have received the SHA-256 hash, not the plaintext.
        Assert.NotEqual("plain-token-abc", store.LastVerifyTokenHash);
        Assert.Equal(AuthToken.Hash("plain-token-abc"), store.LastVerifyTokenHash);
    }

    [Fact]
    public async Task VerifyEmail_returns_InvalidToken_when_store_returns_false()
    {
        var (sender, _, _) = NewSender(new ScriptableStore { VerifyEmailReturns = false });

        var result = await sender.Send(new VerifyEmailCommand("anything"));

        Assert.Equal(AuthMutationOutcome.InvalidToken, result.Outcome);
    }

    [Fact]
    public async Task RequestPasswordReset_returns_token_and_sends_mail_when_store_accepts()
    {
        var (sender, store, mailer) = NewSender(new ScriptableStore { SetResetTokenReturns = true });

        var result = await sender.Send(new RequestPasswordResetCommand("ada@example.com"));

        Assert.NotNull(result.ResetToken);
        // Stored hash differs from emailed plaintext.
        Assert.NotEqual(result.ResetToken, store.LastResetTokenHash);
        Assert.Equal(1, mailer.PasswordResetsSent);
    }

    [Fact]
    public async Task RequestPasswordReset_returns_no_token_and_does_not_email_when_store_declines()
    {
        // Don't reveal whether the email exists -- but also don't email out.
        var (sender, _, mailer) = NewSender(new ScriptableStore { SetResetTokenReturns = false });

        var result = await sender.Send(new RequestPasswordResetCommand("missing@example.com"));

        Assert.Null(result.ResetToken);
        Assert.Equal(0, mailer.PasswordResetsSent);
    }

    [Fact]
    public async Task ResetPassword_returns_Success_when_store_accepts_token()
    {
        var (sender, store, _) = NewSender(new ScriptableStore { ResetPasswordReturns = true });

        var result = await sender.Send(new ResetPasswordCommand(
            "raw-token", NewPassword: "CorrectHorseBatteryStaple!42"));

        Assert.Equal(AuthMutationOutcome.Success, result.Outcome);
        // Token is hashed before being passed to the store.
        Assert.Equal(AuthToken.Hash("raw-token"), store.LastResetVerifyHash);
        // The new password reaches the store as a hash, not plaintext.
        Assert.StartsWith("hash::", store.LastResetNewPasswordHash);
    }

    [Fact]
    public async Task ResetPassword_returns_InvalidToken_when_store_rejects()
    {
        var (sender, _, _) = NewSender(new ScriptableStore { ResetPasswordReturns = false });

        var result = await sender.Send(new ResetPasswordCommand("expired", "CorrectHorseBatteryStaple!42"));

        Assert.Equal(AuthMutationOutcome.InvalidToken, result.Outcome);
    }

    private sealed class ScriptableStore : IAuthUserStore
    {
        public bool VerifyEmailReturns { get; init; }
        public bool SetResetTokenReturns { get; init; }
        public bool ResetPasswordReturns { get; init; }

        public string? LastVerifyTokenHash { get; private set; }
        public string? LastResetTokenHash { get; private set; }
        public string? LastResetVerifyHash { get; private set; }
        public string? LastResetNewPasswordHash { get; private set; }

        public Task<bool> VerifyEmailAsync(string tokenHash, DateTimeOffset verifiedAt, CancellationToken cancellationToken = default)
        {
            LastVerifyTokenHash = tokenHash;
            return Task.FromResult(VerifyEmailReturns);
        }

        public Task<bool> SetPasswordResetTokenAsync(string email, string tokenHash, DateTimeOffset expiresUtc, DateTimeOffset updatedAt, CancellationToken cancellationToken = default)
        {
            LastResetTokenHash = tokenHash;
            return Task.FromResult(SetResetTokenReturns);
        }

        public Task<bool> ResetPasswordAsync(string tokenHash, string passwordHash, DateTimeOffset updatedAt, CancellationToken cancellationToken = default)
        {
            LastResetVerifyHash = tokenHash;
            LastResetNewPasswordHash = passwordHash;
            return Task.FromResult(ResetPasswordReturns);
        }

        public Task<AuthUser?> FindByEmailAsync(string email, CancellationToken cancellationToken = default) =>
            Task.FromResult<AuthUser?>(null);
        public Task<AuthUser?> FindByIdAsync(string userId, CancellationToken cancellationToken = default) =>
            Task.FromResult<AuthUser?>(null);
        public Task<string?> CreatePasswordUserAsync(string email, string passwordHash, string city, string role, string emailVerificationTokenHash, DateTimeOffset now, CancellationToken cancellationToken = default) =>
            Task.FromResult<string?>(null);
        public Task ReplacePasswordHashAsync(string userId, string passwordHash, DateTimeOffset updatedAt, CancellationToken cancellationToken = default) =>
            Task.CompletedTask;
        public Task<bool> DeleteAccountAsync(string userId, DateTimeOffset deletedAt, CancellationToken cancellationToken = default) =>
            Task.FromResult(false);
        public Task RecordSuccessfulSignInAsync(string userId, DateTimeOffset signedInAt, CancellationToken cancellationToken = default) =>
            Task.CompletedTask;
    }

    private sealed class PrefixHasher : IPasswordHasher
    {
        public string Hash(string plain) => "hash::" + plain;
        public PasswordHashVerificationResult Verify(string plain, string hash) =>
            PasswordHashVerificationResult.Success;
    }

    private sealed class CountingMailer : IAuthEmailSender
    {
        public int PasswordResetsSent { get; private set; }
        public Task SendEmailVerificationAsync(string email, string token, CancellationToken cancellationToken = default) =>
            Task.CompletedTask;
        public Task SendPasswordResetAsync(string email, string token, CancellationToken cancellationToken = default)
        {
            PasswordResetsSent++;
            return Task.CompletedTask;
        }
    }
}
