using MediatR;

namespace TheUpperRoom.Application.Auth;

public sealed record SignInCommand(string Email, string? Password) : IRequest<SignInResult>;
