namespace TheUpperRoom.Application.Auth;

public interface IAuthUserStore
{
    Task<AuthUser?> FindByEmailAsync(string email, CancellationToken cancellationToken = default);

    Task<AuthUser?> FindByIdAsync(string userId, CancellationToken cancellationToken = default);

    Task<string?> CreatePasswordUserAsync(
        string email,
        string passwordHash,
        string city,
        string role,
        string emailVerificationTokenHash,
        DateTimeOffset now,
        CancellationToken cancellationToken = default);

    Task ReplacePasswordHashAsync(
        string userId,
        string passwordHash,
        DateTimeOffset updatedAt,
        CancellationToken cancellationToken = default);

    Task<bool> SetPasswordResetTokenAsync(
        string email,
        string tokenHash,
        DateTimeOffset expiresUtc,
        DateTimeOffset updatedAt,
        CancellationToken cancellationToken = default);

    Task<bool> ResetPasswordAsync(
        string tokenHash,
        string passwordHash,
        DateTimeOffset updatedAt,
        CancellationToken cancellationToken = default);

    Task<bool> VerifyEmailAsync(
        string tokenHash,
        DateTimeOffset verifiedAt,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAccountAsync(
        string userId,
        DateTimeOffset deletedAt,
        CancellationToken cancellationToken = default);

    Task RecordSuccessfulSignInAsync(
        string userId,
        DateTimeOffset signedInAt,
        CancellationToken cancellationToken = default);
}
