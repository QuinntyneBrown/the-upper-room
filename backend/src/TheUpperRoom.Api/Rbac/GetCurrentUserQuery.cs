using MediatR;

namespace TheUpperRoom.Api.Rbac;

public sealed record GetCurrentUserQuery(string UserId) : IRequest<MeResponse?>;
