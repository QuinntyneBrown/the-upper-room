using MediatR;

namespace TheUpperRoom.Application.Auth;

public sealed record RequestPasswordResetCommand(string Email) : IRequest<RequestPasswordResetResult>;
