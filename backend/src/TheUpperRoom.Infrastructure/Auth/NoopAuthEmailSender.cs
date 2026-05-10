using TheUpperRoom.Application.Auth;

namespace TheUpperRoom.Infrastructure.Auth;

internal sealed class NoOpAuthEmailSender : IAuthEmailSender
{
    public Task SendEmailVerificationAsync(
        string email,
        string token,
        CancellationToken cancellationToken = default) =>
        Task.CompletedTask;

    public Task SendPasswordResetAsync(
        string email,
        string token,
        CancellationToken cancellationToken = default) =>
        Task.CompletedTask;
}
