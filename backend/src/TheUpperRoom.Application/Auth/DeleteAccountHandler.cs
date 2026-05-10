using MediatR;

namespace TheUpperRoom.Application.Auth;

internal sealed class DeleteAccountHandler : IRequestHandler<DeleteAccountCommand, DeleteAccountResult>
{
    private readonly IAuthUserStore _users;
    private readonly IPasswordHasher _passwords;

    public DeleteAccountHandler(IAuthUserStore users, IPasswordHasher passwords)
    {
        _users = users;
        _passwords = passwords;
    }

    public async Task<DeleteAccountResult> Handle(
        DeleteAccountCommand request,
        CancellationToken cancellationToken)
    {
        var user = await _users.FindByIdAsync(request.UserId, cancellationToken).ConfigureAwait(false);
        if (user?.PasswordHash is null)
        {
            return new DeleteAccountResult(AuthMutationOutcome.NotFound);
        }

        var verification = _passwords.Verify(request.CurrentPassword ?? string.Empty, user.PasswordHash);
        if (verification == PasswordHashVerificationResult.Failed)
        {
            return new DeleteAccountResult(AuthMutationOutcome.InvalidCredentials);
        }

        var deleted = await _users.DeleteAccountAsync(
            user.Id,
            DateTimeOffset.UtcNow,
            cancellationToken).ConfigureAwait(false);

        return new DeleteAccountResult(deleted ? AuthMutationOutcome.Success : AuthMutationOutcome.NotFound);
    }
}
