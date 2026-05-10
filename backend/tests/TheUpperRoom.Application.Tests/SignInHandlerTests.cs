using MediatR;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Application.Auth;

namespace TheUpperRoom.Application.Tests;

public sealed class SignInHandlerTests
{
    private static (ISender Sender, StubAuthUserStore Store) NewSender(
        AuthUser? userByEmail,
        PasswordHashVerificationResult verifyResult)
    {
        var services = new ServiceCollection();
        var store = new StubAuthUserStore(userByEmail);
        services.AddSingleton<IAuthUserStore>(store);
        services.AddSingleton<IPasswordHasher>(new StubHasher(verifyResult));
        services.AddSingleton<IAuthEmailSender>(new NoOpMailer());
        services.AddApplication();
        var sender = services.BuildServiceProvider().GetRequiredService<ISender>();
        return (sender, store);
    }

    [Fact]
    public async Task Returns_InvalidCredentials_when_user_not_found()
    {
        var (sender, _) = NewSender(userByEmail: null, PasswordHashVerificationResult.Success);

        var result = await sender.Send(new SignInCommand("missing@example.com", "pw"));

        Assert.Equal(SignInOutcome.InvalidCredentials, result.Outcome);
        Assert.Null(result.UserId);
    }

    [Fact]
    public async Task Returns_InvalidCredentials_when_user_has_no_password_hash()
    {
        var (sender, _) = NewSender(
            new AuthUser("user-1", "ada@example.com", PasswordHash: null, EmailVerified: true),
            PasswordHashVerificationResult.Success);

        var result = await sender.Send(new SignInCommand("ada@example.com", "pw"));

        Assert.Equal(SignInOutcome.InvalidCredentials, result.Outcome);
    }

    [Fact]
    public async Task Returns_InvalidCredentials_when_password_verification_fails()
    {
        var (sender, _) = NewSender(
            new AuthUser("user-1", "ada@example.com", "stored-hash", EmailVerified: true),
            PasswordHashVerificationResult.Failed);

        var result = await sender.Send(new SignInCommand("ada@example.com", "wrong"));

        Assert.Equal(SignInOutcome.InvalidCredentials, result.Outcome);
    }

    [Fact]
    public async Task Returns_EmailNotVerified_when_password_ok_but_email_pending()
    {
        var (sender, _) = NewSender(
            new AuthUser("user-1", "ada@example.com", "stored-hash", EmailVerified: false),
            PasswordHashVerificationResult.Success);

        var result = await sender.Send(new SignInCommand("ada@example.com", "pw"));

        Assert.Equal(SignInOutcome.EmailNotVerified, result.Outcome);
        Assert.Null(result.UserId);
    }

    [Fact]
    public async Task Returns_Success_with_user_id_and_records_sign_in_on_happy_path()
    {
        var (sender, store) = NewSender(
            new AuthUser("user-1", "ada@example.com", "stored-hash", EmailVerified: true),
            PasswordHashVerificationResult.Success);

        var result = await sender.Send(new SignInCommand("ada@example.com", "pw"));

        Assert.Equal(SignInOutcome.Success, result.Outcome);
        Assert.Equal("user-1", result.UserId);
        Assert.Equal(1, store.SignInsRecorded);
        Assert.Equal(0, store.PasswordRehashes); // no rehash needed when Success
    }

    [Fact]
    public async Task Triggers_password_rehash_when_verifier_returns_Rehash()
    {
        var (sender, store) = NewSender(
            new AuthUser("user-1", "ada@example.com", "stored-hash", EmailVerified: true),
            PasswordHashVerificationResult.Rehash);

        var result = await sender.Send(new SignInCommand("ada@example.com", "pw"));

        Assert.Equal(SignInOutcome.Success, result.Outcome);
        Assert.Equal(1, store.PasswordRehashes);
        Assert.Equal(1, store.SignInsRecorded);
    }

    private sealed class StubAuthUserStore(AuthUser? user) : IAuthUserStore
    {
        public int SignInsRecorded { get; private set; }
        public int PasswordRehashes { get; private set; }

        public Task<AuthUser?> FindByEmailAsync(string email, CancellationToken cancellationToken = default) =>
            Task.FromResult(user);
        public Task RecordSuccessfulSignInAsync(string userId, DateTimeOffset signedInAt, CancellationToken cancellationToken = default)
        {
            SignInsRecorded++;
            return Task.CompletedTask;
        }
        public Task ReplacePasswordHashAsync(string userId, string passwordHash, DateTimeOffset updatedAt, CancellationToken cancellationToken = default)
        {
            PasswordRehashes++;
            return Task.CompletedTask;
        }

        public Task<AuthUser?> FindByIdAsync(string userId, CancellationToken cancellationToken = default) =>
            throw new NotImplementedException();
        public Task<string?> CreatePasswordUserAsync(string email, string passwordHash, string city, string role, string emailVerificationTokenHash, DateTimeOffset now, CancellationToken cancellationToken = default) =>
            throw new NotImplementedException();
        public Task<bool> SetPasswordResetTokenAsync(string email, string tokenHash, DateTimeOffset expiresUtc, DateTimeOffset updatedAt, CancellationToken cancellationToken = default) =>
            throw new NotImplementedException();
        public Task<bool> ResetPasswordAsync(string tokenHash, string passwordHash, DateTimeOffset updatedAt, CancellationToken cancellationToken = default) =>
            throw new NotImplementedException();
        public Task<bool> VerifyEmailAsync(string tokenHash, DateTimeOffset verifiedAt, CancellationToken cancellationToken = default) =>
            throw new NotImplementedException();
        public Task<bool> DeleteAccountAsync(string userId, DateTimeOffset deletedAt, CancellationToken cancellationToken = default) =>
            throw new NotImplementedException();
    }

    private sealed class StubHasher(PasswordHashVerificationResult result) : IPasswordHasher
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
