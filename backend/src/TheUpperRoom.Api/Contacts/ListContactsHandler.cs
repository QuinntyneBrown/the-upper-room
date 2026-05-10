using MediatR;
using TheUpperRoom.Api.Rbac;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Domain.Cities;
using TheUpperRoom.Infrastructure.Contacts;

namespace TheUpperRoom.Api.Contacts;

internal sealed class ListContactsHandler : IRequestHandler<ListContactsQuery, ListContactsResult>
{
    private readonly ContactsDbContext _db;
    private readonly IUserDirectory _users;

    public ListContactsHandler(ContactsDbContext db, IUserDirectory users)
    {
        _db = db;
        _users = users;
    }

    public Task<ListContactsResult> Handle(ListContactsQuery request, CancellationToken cancellationToken)
    {
        var user = _users.GetById(request.UserId);
        if (user is null)
            return Task.FromResult(new ListContactsResult(Array.Empty<Contact>(), 0, ContactsOutcome.Unauthorized));

        var allCities = request.Scope == "all" || request.Scope == "__all__";
        var cityFilter = !allCities && !string.IsNullOrEmpty(request.Scope) ? request.Scope : null;

        if ((allCities || cityFilter != null) && user.Role != Roles.SystemAdmin)
            return Task.FromResult(new ListContactsResult(Array.Empty<Contact>(), 0, ContactsOutcome.Forbidden));

        IEnumerable<ContactRow> items;
        if (allCities)
            items = _db.Contacts.AsEnumerable();
        else if (cityFilter != null && user.Role == Roles.SystemAdmin)
            items = _db.Contacts.AsEnumerable().Where(c => c.CityId.Equals(cityFilter, StringComparison.OrdinalIgnoreCase));
        else if (user.Role == Roles.SystemAdmin)
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
