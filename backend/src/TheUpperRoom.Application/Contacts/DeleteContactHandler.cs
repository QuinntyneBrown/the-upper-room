using System.Text.Json;
using MediatR;
using TheUpperRoom.Application.Audit;
using TheUpperRoom.Application.Cities;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Application.Contacts;

internal sealed class DeleteContactHandler : IRequestHandler<DeleteContactCommand, MutateContactResult>
{
    private readonly IContactsDbContext _db;
    private readonly IUserDirectory _users;

    public DeleteContactHandler(IContactsDbContext db, IUserDirectory users)
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

        AuditStore.Record(user.Id, "Contact", request.Id, "Delete", beforeJson: JsonSerializer.Serialize(ContactsMapping.ToContact(c)));
        _db.Contacts.Remove(c);
        _db.SaveChanges();
        return Task.FromResult(new MutateContactResult(null, ContactsOutcome.NoContent, null));
    }
}
