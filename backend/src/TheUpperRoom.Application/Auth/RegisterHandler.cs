using MediatR;

namespace TheUpperRoom.Application.Auth;

internal sealed class RegisterHandler : IRequestHandler<RegisterCommand, RegisterResult>
{
    private const string DefaultCity = "Toronto";
    private const string DefaultRole = "Member";

    private readonly IAuthUserStore _users;
    private readonly IPasswordHasher _passwords;
    private readonly IAuthEmailSender _emailSender;

    public RegisterHandler(
        IAuthUserStore users,
        IPasswordHasher passwords,
        IAuthEmailSender emailSender)
    {
        _users = users;
        _passwords = passwords;
        _emailSender = emailSender;
    }

    public async Task<RegisterResult> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var token = AuthToken.Create();
        var now = DateTimeOffset.UtcNow;
        var userId = await _users.CreatePasswordUserAsync(
            request.Email,
            _passwords.Hash(request.Password ?? string.Empty),
            string.IsNullOrWhiteSpace(request.City) ? DefaultCity : request.City.Trim(),
            DefaultRole,
            AuthToken.Hash(token),
            now,
            cancellationToken).ConfigureAwait(false);

        if (userId is null)
        {
            return new RegisterResult(AuthMutationOutcome.Conflict);
        }

        await _emailSender.SendEmailVerificationAsync(request.Email, token, cancellationToken)
            .ConfigureAwait(false);
        return new RegisterResult(AuthMutationOutcome.Created, userId, token);
    }
}
