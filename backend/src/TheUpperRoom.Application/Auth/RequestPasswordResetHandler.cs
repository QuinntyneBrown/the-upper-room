using MediatR;

namespace TheUpperRoom.Application.Auth;

internal sealed class RequestPasswordResetHandler
    : IRequestHandler<RequestPasswordResetCommand, RequestPasswordResetResult>
{
    private readonly IAuthUserStore _users;
    private readonly IAuthEmailSender _emailSender;

    public RequestPasswordResetHandler(IAuthUserStore users, IAuthEmailSender emailSender)
    {
        _users = users;
        _emailSender = emailSender;
    }

    public async Task<RequestPasswordResetResult> Handle(
        RequestPasswordResetCommand request,
        CancellationToken cancellationToken)
    {
        var token = AuthToken.Create();
        var stored = await _users.SetPasswordResetTokenAsync(
            request.Email,
            AuthToken.Hash(token),
            DateTimeOffset.UtcNow.AddHours(1),
            DateTimeOffset.UtcNow,
            cancellationToken).ConfigureAwait(false);

        if (!stored)
        {
            return new RequestPasswordResetResult();
        }

        await _emailSender.SendPasswordResetAsync(request.Email, token, cancellationToken)
            .ConfigureAwait(false);
        return new RequestPasswordResetResult(token);
    }
}
