using MediatR;

namespace TheUpperRoom.Application.Auth;

internal sealed class VerifyEmailHandler : IRequestHandler<VerifyEmailCommand, VerifyEmailResult>
{
    private readonly IAuthUserStore _users;

    public VerifyEmailHandler(IAuthUserStore users)
    {
        _users = users;
    }

    public async Task<VerifyEmailResult> Handle(
        VerifyEmailCommand request,
        CancellationToken cancellationToken)
    {
        var verified = await _users.VerifyEmailAsync(
            AuthToken.Hash(request.Token),
            DateTimeOffset.UtcNow,
            cancellationToken).ConfigureAwait(false);

        return new VerifyEmailResult(verified ? AuthMutationOutcome.Success : AuthMutationOutcome.InvalidToken);
    }
}
