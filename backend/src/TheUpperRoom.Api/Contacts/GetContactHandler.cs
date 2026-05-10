using MediatR;
using TheUpperRoom.Api.Rbac;
using TheUpperRoom.Application.Cities;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Domain.Cities;
using TheUpperRoom.Infrastructure.Contacts;

namespace TheUpperRoom.Api.Contacts;

internal sealed class GetContactHandler : IRequestHandler<GetContactQuery, GetContactResult>
{
    private readonly ContactsDbContext _db;
    private readonly IUserDirectory _users;

    public GetContactHandler(ContactsDbContext db, IUserDirectory users)
    {
        _db = db;
        _users = users;
    }

    public Task<GetContactResult> Handle(GetContactQuery request, CancellationToken cancellationToken)
    {
        var user = _users.GetById(request.UserId);
        if (user is null)
            return Task.FromResult(new GetContactResult(null, ContactsOutcome.Unauthorized));

        var allCities = request.Scope == "all";
        if (allCities && user.Role != Roles.SystemAdmin)
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
