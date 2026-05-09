using System.Text.Json;
using MediatR;
using TheUpperRoom.Api.Audit;
using TheUpperRoom.Api.Rbac;
using TheUpperRoom.Application.Cities;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Domain.Cities;

namespace TheUpperRoom.Api.Contacts;

public enum ContactsOutcome
{
    Ok,
    Created,
    NoContent,
    Unauthorized,
    Forbidden,
    NotFound,
    BadRequest,
    Unprocessable,
}

public sealed record ListContactsQuery(string UserId, string? Search, int? Page, int? Size, string? Scope)
    : IRequest<ListContactsResult>;

public sealed record ListContactsResult(Contact[] Items, int Total, ContactsOutcome Outcome);

public sealed record GetContactQuery(string UserId, string Id, string? Scope) : IRequest<GetContactResult>;

public sealed record GetContactResult(Contact? Contact, ContactsOutcome Outcome);

public sealed record CreateContactCommand(string UserId, CreateContactRequest? Body) : IRequest<MutateContactResult>;

public sealed record UpdateContactCommand(string UserId, string Id, CreateContactRequest? Body) : IRequest<MutateContactResult>;

public sealed record PatchContactCommand(string UserId, string Id, PatchContactRequest? Body) : IRequest<MutateContactResult>;

public sealed record DeleteContactCommand(string UserId, string Id) : IRequest<MutateContactResult>;

public sealed record MutateContactResult(Contact? Contact, ContactsOutcome Outcome, string? Error);

internal static class ContactsDisplayName
{
    public static string Build(CreateContactRequest body)
    {
        var name = string.Join(
            ' ',
            new[] { body.FirstName.Trim(), body.LastName?.Trim() }
                .Where(s => !string.IsNullOrEmpty(s)));
        return body.DisplayName ?? name;
    }
}

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

        var allCities = request.Scope == "all";
        if (allCities && user.Role != Roles.SystemAdmin)
            return Task.FromResult(new ListContactsResult(Array.Empty<Contact>(), 0, ContactsOutcome.Forbidden));

        IEnumerable<ContactRow> items = allCities || user.Role == Roles.SystemAdmin
            ? _db.Contacts.AsEnumerable()
            : _db.Contacts.Where(c => c.CityId == user.City).AsEnumerable();

        if (!string.IsNullOrEmpty(request.Search))
            items = items.Where(c => c.Name.Contains(request.Search, StringComparison.OrdinalIgnoreCase));

        var allItems = items.Select(c => c.ToContact()).ToArray();
        var total = allItems.Length;

        if (request.Page.GetValueOrDefault() > 1 && request.Size.GetValueOrDefault() > 0)
            allItems = allItems.Skip((request.Page!.Value - 1) * request.Size!.Value).Take(request.Size.Value).ToArray();
        else if (request.Size.GetValueOrDefault() > 0)
            allItems = allItems.Take(request.Size!.Value).ToArray();

        return Task.FromResult(new ListContactsResult(allItems, total, ContactsOutcome.Ok));
    }
}

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

        if (allCities) return Task.FromResult(new GetContactResult(c.ToContact(), ContactsOutcome.Ok));

        var visible = CityScope.VisibleOrNull(c, user.City);
        return Task.FromResult(visible is null
            ? new GetContactResult(null, ContactsOutcome.NotFound)
            : new GetContactResult(c.ToContact(), ContactsOutcome.Ok));
    }
}

internal sealed class CreateContactHandler : IRequestHandler<CreateContactCommand, MutateContactResult>
{
    private readonly ContactsDbContext _db;
    private readonly IUserDirectory _users;

    public CreateContactHandler(ContactsDbContext db, IUserDirectory users)
    {
        _db = db;
        _users = users;
    }

    public Task<MutateContactResult> Handle(CreateContactCommand request, CancellationToken cancellationToken)
    {
        var user = _users.GetById(request.UserId);
        if (user is null) return Task.FromResult(new MutateContactResult(null, ContactsOutcome.Unauthorized, null));
        if (request.Body is null) return Task.FromResult(new MutateContactResult(null, ContactsOutcome.BadRequest, null));
        if (string.IsNullOrWhiteSpace(request.Body.FirstName))
            return Task.FromResult(new MutateContactResult(null, ContactsOutcome.Unprocessable, "First name is required."));

        var id = Guid.NewGuid().ToString("N")[..8];
        var row = new ContactRow { Id = id, Name = ContactsDisplayName.Build(request.Body), CityId = user.City };
        _db.Contacts.Add(row);
        _db.SaveChanges();

        var contact = row.ToContact();
        AuditStore.Record(user.Id, "Contact", id, "Create", afterJson: JsonSerializer.Serialize(contact));
        return Task.FromResult(new MutateContactResult(contact, ContactsOutcome.Created, null));
    }
}

internal sealed class UpdateContactHandler : IRequestHandler<UpdateContactCommand, MutateContactResult>
{
    private readonly ContactsDbContext _db;
    private readonly IUserDirectory _users;

    public UpdateContactHandler(ContactsDbContext db, IUserDirectory users)
    {
        _db = db;
        _users = users;
    }

    public Task<MutateContactResult> Handle(UpdateContactCommand request, CancellationToken cancellationToken)
    {
        var user = _users.GetById(request.UserId);
        if (user is null) return Task.FromResult(new MutateContactResult(null, ContactsOutcome.Unauthorized, null));
        if (request.Body is null) return Task.FromResult(new MutateContactResult(null, ContactsOutcome.BadRequest, null));
        if (string.IsNullOrWhiteSpace(request.Body.FirstName))
            return Task.FromResult(new MutateContactResult(null, ContactsOutcome.Unprocessable, "First name is required."));

        var c = _db.Contacts.Find(request.Id);
        if (c is null) return Task.FromResult(new MutateContactResult(null, ContactsOutcome.NotFound, null));
        if (CityScope.VisibleOrNull(c, user.City) is null)
            return Task.FromResult(new MutateContactResult(null, ContactsOutcome.NotFound, null));

        var before = JsonSerializer.Serialize(c.ToContact());
        c.Name = ContactsDisplayName.Build(request.Body);
        _db.SaveChanges();
        var after = JsonSerializer.Serialize(c.ToContact());
        AuditStore.Record(user.Id, "Contact", request.Id, "Update", before, after);
        return Task.FromResult(new MutateContactResult(c.ToContact(), ContactsOutcome.Ok, null));
    }
}

internal sealed class PatchContactHandler : IRequestHandler<PatchContactCommand, MutateContactResult>
{
    private readonly ContactsDbContext _db;
    private readonly IUserDirectory _users;

    public PatchContactHandler(ContactsDbContext db, IUserDirectory users)
    {
        _db = db;
        _users = users;
    }

    public Task<MutateContactResult> Handle(PatchContactCommand request, CancellationToken cancellationToken)
    {
        var user = _users.GetById(request.UserId);
        if (user is null) return Task.FromResult(new MutateContactResult(null, ContactsOutcome.Unauthorized, null));

        var c = _db.Contacts.Find(request.Id);
        if (c is null) return Task.FromResult(new MutateContactResult(null, ContactsOutcome.NotFound, null));
        if (CityScope.VisibleOrNull(c, user.City) is null)
            return Task.FromResult(new MutateContactResult(null, ContactsOutcome.NotFound, null));

        if (request.Body?.Name is not null)
        {
            var before = JsonSerializer.Serialize(c.ToContact());
            c.Name = request.Body.Name;
            _db.SaveChanges();
            var after = JsonSerializer.Serialize(c.ToContact());
            AuditStore.Record(user.Id, "Contact", request.Id, "Update", before, after);
        }

        return Task.FromResult(new MutateContactResult(c.ToContact(), ContactsOutcome.Ok, null));
    }
}

internal sealed class DeleteContactHandler : IRequestHandler<DeleteContactCommand, MutateContactResult>
{
    private readonly ContactsDbContext _db;
    private readonly IUserDirectory _users;

    public DeleteContactHandler(ContactsDbContext db, IUserDirectory users)
    {
        _db = db;
        _users = users;
    }

    public Task<MutateContactResult> Handle(DeleteContactCommand request, CancellationToken cancellationToken)
    {
        var user = _users.GetById(request.UserId);
        if (user is null) return Task.FromResult(new MutateContactResult(null, ContactsOutcome.Unauthorized, null));

        var c = _db.Contacts.Find(request.Id);
        if (c is null) return Task.FromResult(new MutateContactResult(null, ContactsOutcome.NotFound, null));
        if (CityScope.VisibleOrNull(c, user.City) is null)
            return Task.FromResult(new MutateContactResult(null, ContactsOutcome.NotFound, null));

        AuditStore.Record(user.Id, "Contact", request.Id, "Delete", beforeJson: JsonSerializer.Serialize(c.ToContact()));
        _db.Contacts.Remove(c);
        _db.SaveChanges();
        return Task.FromResult(new MutateContactResult(null, ContactsOutcome.NoContent, null));
    }
}
