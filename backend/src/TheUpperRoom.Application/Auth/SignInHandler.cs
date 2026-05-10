using MediatR;

namespace TheUpperRoom.Application.Auth;

internal sealed class SignInHandler : IRequestHandler<SignInCommand, SignInResult>
{
    private readonly IAuthUserStore _users;
    private readonly IPasswordHasher _passwords;

    public SignInHandler(IAuthUserStore users, IPasswordHasher passwords)
    {
        _users = users;
        _passwords = passwords;
    }

    public async Task<SignInResult> Handle(SignInCommand request, CancellationToken cancellationToken)
    {
        var user = await _users.FindByEmailAsync(request.Email, cancellationToken).ConfigureAwait(false);
        if (user?.PasswordHash is null)
        {
            return new SignInResult(SignInOutcome.InvalidCredentials);
        }

        var verification = _passwords.Verify(request.Password ?? string.Empty, user.PasswordHash);
        if (verification == PasswordHashVerificationResult.Failed)
        {
            return new SignInResult(SignInOutcome.InvalidCredentials);
        }

        if (!user.EmailVerified)
        {
            return new SignInResult(SignInOutcome.EmailNotVerified);
        }

        var now = DateTimeOffset.UtcNow;
        if (verification == PasswordHashVerificationResult.Rehash)
        {
            await _users.ReplacePasswordHashAsync(
                user.Id,
                _passwords.Hash(request.Password ?? string.Empty),
                now,
                cancellationToken).ConfigureAwait(false);
        }

        await _users.RecordSuccessfulSignInAsync(user.Id, now, cancellationToken).ConfigureAwait(false);
        return new SignInResult(SignInOutcome.Success, user.Id);
    }
}
