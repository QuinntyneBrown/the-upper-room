using MediatR;

namespace TheUpperRoom.Application.Auth;

public sealed record ChangePasswordCommand(
    string UserId,
    string? CurrentPassword,
    string? NewPassword) : IRequest<ChangePasswordResult>;
