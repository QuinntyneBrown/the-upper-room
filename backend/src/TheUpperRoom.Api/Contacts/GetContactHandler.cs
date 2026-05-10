using MediatR;
using TheUpperRoom.Application.Cities;
using TheUpperRoom.Application.Rbac;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Domain.Cities;
using TheUpperRoom.Domain.Rbac;
using TheUpperRoom.Infrastructure.Contacts;

namespace TheUpperRoom.Api.Contacts;

internal sealed class GetContactHandler : IRequestHandler<GetContactQuery, GetContactResult>
{
    private readonly ContactsDbContext _db;
    private readonly IUserDirectory _users;
    private readonly IPermissionChecker _permissions;

    public GetContactHandler(ContactsDbContext db, IUserDirectory users, IPermissionChecker permissions)
    {
        _db = db;
        _users = users;
        _permissions = permissions;
    }

    public Task<GetContactResult> Handle(GetContactQuery request, CancellationToken cancellationToken)
    {
        var user = _users.GetById(request.UserId);
        if (user is null)
            return Task.FromResult(new GetContactResult(null, ContactsOutcome.Unauthorized));

        var allCities = request.Scope == "all";
        if (allCities && !_permissions.HasPermission(user.Role, PermissionResources.City, PermissionActions.Switch))
            return Task.FromResult(new GetContactResult(null, ContactsOutcome.Forbidden));

        var c = _db.Contacts.Find(request.Id);
        if (c is null) return Task.FromResult(new GetContactResult(null, ContactsOutcome.NotFound));

        if (allCities) return Task.FromResult(new GetContactResult(ContactsMapping.ToContact(c), ContactsOutcome.Ok));

        var visible = CityScope.VisibleOrNull(c, user.City);
        return Task.FromResult(visible is null
            ? new GetContactResult(null, ContactsOutcome.NotFound)
            : new GetContactResult(ContactsMapping.ToContact(c), ContactsOutcome.Ok));
    }
}
