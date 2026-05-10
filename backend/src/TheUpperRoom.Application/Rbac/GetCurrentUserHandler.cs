using MediatR;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Domain.Rbac;

namespace TheUpperRoom.Application.Rbac;

internal sealed class GetCurrentUserHandler : IRequestHandler<GetCurrentUserQuery, MeResponse?>
{
    private readonly IUserDirectory _users;

    public GetCurrentUserHandler(IUserDirectory users) => _users = users;

    public Task<MeResponse?> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        var user = _users.GetById(request.UserId);
        if (user is null) return Task.FromResult<MeResponse?>(null);

        return Task.FromResult<MeResponse?>(new MeResponse(
            user.Id,
            user.Email,
            user.City,
            new[] { user.Role },
            RoleCatalog.PermissionsFor(user.Role).Select(p => p.ToString()).ToArray()));
    }
}
