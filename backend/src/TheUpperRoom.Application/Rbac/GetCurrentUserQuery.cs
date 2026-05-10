using MediatR;

namespace TheUpperRoom.Application.Rbac;

public sealed record GetCurrentUserQuery(string UserId) : IRequest<MeResponse?>;
