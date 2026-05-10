using MediatR;

namespace TheUpperRoom.Application.Auth;

internal sealed class ResetPasswordHandler : IRequestHandler<ResetPasswordCommand, ResetPasswordResult>
{
    private readonly IAuthUserStore _users;
    private readonly IPasswordHasher _passwords;

    public ResetPasswordHandler(IAuthUserStore users, IPasswordHasher passwords)
    {
        _users = users;
        _passwords = passwords;
    }

    public async Task<ResetPasswordResult> Handle(
        ResetPasswordCommand request,
        CancellationToken cancellationToken)
    {
        var reset = await _users.ResetPasswordAsync(
            AuthToken.Hash(request.Token),
            _passwords.Hash(request.NewPassword ?? string.Empty),
            DateTimeOffset.UtcNow,
            cancellationToken).ConfigureAwait(false);

        return new ResetPasswordResult(reset ? AuthMutationOutcome.Success : AuthMutationOutcome.InvalidToken);
    }
}
