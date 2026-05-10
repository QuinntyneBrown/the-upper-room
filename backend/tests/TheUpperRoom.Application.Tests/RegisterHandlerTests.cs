using MediatR;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Application.Auth;

namespace TheUpperRoom.Application.Tests;

// Exercises RegisterHandler with stub dependencies. The handler is
// internal sealed; access via ISender.
public sealed class RegisterHandlerTests
{
    private static (ISender Sender, StubAuthUserStore Store, StubEmailSender Mailer) NewSender(
        bool emailExists)
    {
        var services = new ServiceCollection();
        var store = new StubAuthUserStore(emailExists);
        var mailer = new StubEmailSender();
        services.AddSingleton<IAuthUserStore>(store);
        services.AddSingleton<IPasswordHasher>(new StubHasher());
        services.AddSingleton<IAuthEmailSender>(mailer);
        services.AddApplication();
        var sender = services.BuildServiceProvider().GetRequiredService<ISender>();
        return (sender, store, mailer);
    }

    [Fact]
    public async Task Returns_Conflict_when_email_already_taken()
    {
        var (sender, _, mailer) = NewSender(emailExists: true);

        var result = await sender.Send(new RegisterCommand(
            "ada@example.com", "CorrectHorseBatteryStaple!42"));

        Assert.Equal(AuthMutationOutcome.Conflict, result.Outcome);
        Assert.Null(result.UserId);
        Assert.Null(result.EmailVerificationToken);
        // No verification email is sent on conflict.
        Assert.Equal(0, mailer.VerificationsSent);
    }

    [Fact]
    public async Task Returns_Created_with_user_id_and_token_on_happy_path()
    {
        var (sender, store, mailer) = NewSender(emailExists: false);

        var result = await sender.Send(new RegisterCommand(
            "ada@example.com", "CorrectHorseBatteryStaple!42"));

        Assert.Equal(AuthMutationOutcome.Created, result.Outcome);
        Assert.NotNull(result.UserId);
        Assert.NotNull(result.EmailVerificationToken);
        // Token is the *plaintext* the user receives via email; the store
        // gets the SHA-256 hash. They must differ.
        Assert.NotEqual(result.EmailVerificationToken, store.LastVerificationTokenHash);
        Assert.Equal(1, mailer.VerificationsSent);
    }

    [Fact]
    public async Task Stores_password_via_hasher_not_plain_text()
    {
        var (sender, store, _) = NewSender(emailExists: false);

        const string Password = "CorrectHorseBatteryStaple!42";
        await sender.Send(new RegisterCommand("ada@example.com", Password));

        Assert.NotNull(store.LastPasswordHash);
        Assert.NotEqual(Password, store.LastPasswordHash);
        Assert.StartsWith("hash::", store.LastPasswordHash);
    }

    [Fact]
    public async Task Default_city_is_Toronto_when_request_city_is_blank()
    {
        var (sender, store, _) = NewSender(emailExists: false);

        await sender.Send(new RegisterCommand(
            "ada@example.com", "CorrectHorseBatteryStaple!42", City: null));

        Assert.Equal("Toronto", store.LastCity);
    }

    [Fact]
    public async Task Trims_provided_city_when_non_blank()
    {
        var (sender, store, _) = NewSender(emailExists: false);

        await sender.Send(new RegisterCommand(
            "ada@example.com", "CorrectHorseBatteryStaple!42", City: "  Halifax  "));

        Assert.Equal("Halifax", store.LastCity);
    }

    private sealed class StubAuthUserStore : IAuthUserStore
    {
        private readonly bool _emailExists;
        public StubAuthUserStore(bool emailExists) => _emailExists = emailExists;

        public string? LastPasswordHash { get; private set; }
        public string? LastVerificationTokenHash { get; private set; }
        public string? LastCity { get; private set; }

        public Task<string?> CreatePasswordUserAsync(
            string email, string passwordHash, string city, string role,
            string emailVerificationTokenHash, DateTimeOffset now,
            CancellationToken cancellationToken = default)
        {
            if (_emailExists) return Task.FromResult<string?>(null);
            LastPasswordHash = passwordHash;
            LastVerificationTokenHash = emailVerificationTokenHash;
            LastCity = city;
            return Task.FromResult<string?>("user-new");
        }

        public Task<AuthUser?> FindByEmailAsync(string email, CancellationToken cancellationToken = default) =>
            throw new NotImplementedException();
        public Task<AuthUser?> FindByIdAsync(string userId, CancellationToken cancellationToken = default) =>
            throw new NotImplementedException();
        public Task ReplacePasswordHashAsync(string userId, string passwordHash, DateTimeOffset updatedAt, CancellationToken cancellationToken = default) =>
            throw new NotImplementedException();
        public Task<bool> SetPasswordResetTokenAsync(string email, string tokenHash, DateTimeOffset expiresUtc, DateTimeOffset updatedAt, CancellationToken cancellationToken = default) =>
            throw new NotImplementedException();
        public Task<bool> ResetPasswordAsync(string tokenHash, string passwordHash, DateTimeOffset updatedAt, CancellationToken cancellationToken = default) =>
            throw new NotImplementedException();
        public Task<bool> VerifyEmailAsync(string tokenHash, DateTimeOffset verifiedAt, CancellationToken cancellationToken = default) =>
            throw new NotImplementedException();
        public Task<bool> DeleteAccountAsync(string userId, DateTimeOffset deletedAt, CancellationToken cancellationToken = default) =>
            throw new NotImplementedException();
        public Task RecordSuccessfulSignInAsync(string userId, DateTimeOffset signedInAt, CancellationToken cancellationToken = default) =>
            throw new NotImplementedException();
    }

    private sealed class StubHasher : IPasswordHasher
    {
        public string Hash(string plain) => "hash::" + plain;
        public PasswordHashVerificationResult Verify(string plain, string hash) =>
            hash == "hash::" + plain
                ? PasswordHashVerificationResult.Success
                : PasswordHashVerificationResult.Failed;
    }

    private sealed class StubEmailSender : IAuthEmailSender
    {
        public int VerificationsSent { get; private set; }
        public Task SendEmailVerificationAsync(string email, string token, CancellationToken cancellationToken = default)
        {
            VerificationsSent++;
            return Task.CompletedTask;
        }
        public Task SendPasswordResetAsync(string email, string token, CancellationToken cancellationToken = default) =>
            Task.CompletedTask;
    }
}
