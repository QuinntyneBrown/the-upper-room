using MediatR;

namespace TheUpperRoom.Application.Auth;

public sealed record DeleteAccountCommand(
    string UserId,
    string? CurrentPassword) : IRequest<DeleteAccountResult>;
