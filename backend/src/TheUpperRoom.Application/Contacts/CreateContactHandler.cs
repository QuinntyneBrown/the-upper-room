using System.Text.Json;
using MediatR;
using TheUpperRoom.Application.Audit;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Application.Contacts;

internal sealed class CreateContactHandler : IRequestHandler<CreateContactCommand, MutateContactResult>
{
    private readonly IContactsDbContext _db;
    private readonly IUserDirectory _users;

    public CreateContactHandler(IContactsDbContext db, IUserDirectory users)
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

        var contact = ContactsMapping.ToContact(row);
        AuditStore.Record(user.Id, "Contact", id, "Create", afterJson: JsonSerializer.Serialize(contact));
        return Task.FromResult(new MutateContactResult(contact, ContactsOutcome.Created, null));
    }
}
