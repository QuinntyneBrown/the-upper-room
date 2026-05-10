using MediatR;

namespace TheUpperRoom.Application.Auth;

public sealed record ResetPasswordCommand(
    string Token,
    string? NewPassword) : IRequest<ResetPasswordResult>;
