namespace TheUpperRoom.Application.Auth;

public interface IAuthUserStore
{
    Task<AuthUser?> FindByEmailAsync(string email, CancellationToken cancellationToken = default);

    Task ReplacePasswordHashAsync(
        string userId,
        string passwordHash,
        DateTimeOffset updatedAt,
        CancellationToken cancellationToken = default);

    Task RecordSuccessfulSignInAsync(
        string userId,
        DateTimeOffset signedInAt,
        CancellationToken cancellationToken = default);
}
