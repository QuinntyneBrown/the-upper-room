namespace TheUpperRoom.Api.Auth;

public interface IAuthRateLimiter
{
    Task<bool> IsSignInLockedAsync(
        string email,
        DateTimeOffset now,
        CancellationToken cancellationToken = default);

    Task<bool> RecordFailedSignInAsync(
        string email,
        DateTimeOffset now,
        CancellationToken cancellationToken = default);

    Task ClearSignInAsync(
        string email,
        CancellationToken cancellationToken = default);

    Task<bool> TryRecordForgotPasswordAsync(
        string email,
        DateTimeOffset now,
        CancellationToken cancellationToken = default);
}
