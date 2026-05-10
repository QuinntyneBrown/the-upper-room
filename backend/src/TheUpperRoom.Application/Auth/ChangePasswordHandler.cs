using MediatR;

namespace TheUpperRoom.Application.Auth;

internal sealed class ChangePasswordHandler : IRequestHandler<ChangePasswordCommand, ChangePasswordResult>
{
    private readonly IAuthUserStore _users;
    private readonly IPasswordHasher _passwords;

    public ChangePasswordHandler(IAuthUserStore users, IPasswordHasher passwords)
    {
        _users = users;
        _passwords = passwords;
    }

    public async Task<ChangePasswordResult> Handle(
        ChangePasswordCommand request,
        CancellationToken cancellationToken)
    {
        var user = await _users.FindByIdAsync(request.UserId, cancellationToken).ConfigureAwait(false);
        if (user?.PasswordHash is null)
        {
            return new ChangePasswordResult(AuthMutationOutcome.NotFound);
        }

        var verification = _passwords.Verify(request.CurrentPassword ?? string.Empty, user.PasswordHash);
        if (verification == PasswordHashVerificationResult.Failed)
        {
            return new ChangePasswordResult(AuthMutationOutcome.InvalidCredentials);
        }

        await _users.ReplacePasswordHashAsync(
            user.Id,
            _passwords.Hash(request.NewPassword ?? string.Empty),
            DateTimeOffset.UtcNow,
            cancellationToken).ConfigureAwait(false);

        return new ChangePasswordResult(AuthMutationOutcome.Success);
    }
}
