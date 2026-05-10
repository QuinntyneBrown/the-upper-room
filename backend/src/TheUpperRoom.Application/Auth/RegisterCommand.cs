using MediatR;

namespace TheUpperRoom.Application.Auth;

public sealed record RegisterCommand(
    string Email,
    string? Password,
    string? City = null) : IRequest<RegisterResult>;
