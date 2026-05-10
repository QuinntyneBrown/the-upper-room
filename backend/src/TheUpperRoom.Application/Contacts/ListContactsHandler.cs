using MediatR;
using TheUpperRoom.Application.Rbac;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Domain.Cities;
using TheUpperRoom.Domain.Rbac;

namespace TheUpperRoom.Application.Contacts;

internal sealed class ListContactsHandler : IRequestHandler<ListContactsQuery, ListContactsResult>
{
    private readonly IContactsDbContext _db;
    private readonly IUserDirectory _users;
    private readonly IPermissionChecker _permissions;

    public ListContactsHandler(IContactsDbContext db, IUserDirectory users, IPermissionChecker permissions)
    {
        _db = db;
        _users = users;
        _permissions = permissions;
    }

    public Task<ListContactsResult> Handle(ListContactsQuery request, CancellationToken cancellationToken)
    {
        var user = _users.GetById(request.UserId);
        if (user is null)
            return Task.FromResult(new ListContactsResult(Array.Empty<Contact>(), 0, ContactsOutcome.Unauthorized));

        var allCities = request.Scope == "all" || request.Scope == "__all__";
        var cityFilter = !allCities && !string.IsNullOrEmpty(request.Scope) ? request.Scope : null;
        var canSwitchCity = _permissions.HasPermission(user.Role, PermissionResources.City, PermissionActions.Switch);

        if ((allCities || cityFilter != null) && !canSwitchCity)
            return Task.FromResult(new ListContactsResult(Array.Empty<Contact>(), 0, ContactsOutcome.Forbidden));

        IEnumerable<ContactRow> items;
        if (allCities)
            items = _db.Contacts.AsEnumerable();
        else if (cityFilter != null && canSwitchCity)
            items = _db.Contacts.AsEnumerable().Where(c => c.CityId.Equals(cityFilter, StringComparison.OrdinalIgnoreCase));
        else if (canSwitchCity)
            items = _db.Contacts.AsEnumerable();
        else
            items = _db.Contacts.AsEnumerable().Where(c => c.CityId.Equals(user.City, StringComparison.OrdinalIgnoreCase));

        if (!request.IncludeArchived)
            items = items.Where(c => !c.IsArchived);

        if (!string.IsNullOrEmpty(request.Search))
            items = items.Where(c => c.Name.Contains(request.Search, StringComparison.OrdinalIgnoreCase));

        var allItems = items.Select(ContactsMapping.ToContact).ToArray();
        var total = allItems.Length;

        if (request.Page.GetValueOrDefault() > 1 && request.Size.GetValueOrDefault() > 0)
            allItems = allItems.Skip((request.Page!.Value - 1) * request.Size!.Value).Take(request.Size.Value).ToArray();
        else if (request.Size.GetValueOrDefault() > 0)
            allItems = allItems.Take(request.Size!.Value).ToArray();

        return Task.FromResult(new ListContactsResult(allItems, total, ContactsOutcome.Ok));
    }
}
