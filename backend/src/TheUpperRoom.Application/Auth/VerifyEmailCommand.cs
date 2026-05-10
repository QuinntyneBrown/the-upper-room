using MediatR;

namespace TheUpperRoom.Application.Auth;

public sealed record VerifyEmailCommand(string Token) : IRequest<VerifyEmailResult>;
