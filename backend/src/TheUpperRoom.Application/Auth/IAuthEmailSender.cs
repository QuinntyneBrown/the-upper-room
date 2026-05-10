namespace TheUpperRoom.Application.Auth;

public interface IAuthEmailSender
{
    Task SendEmailVerificationAsync(
        string email,
        string token,
        CancellationToken cancellationToken = default);

    Task SendPasswordResetAsync(
        string email,
        string token,
        CancellationToken cancellationToken = default);
}
