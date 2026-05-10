using System.Text.Json;
using MediatR;
using TheUpperRoom.Api.Audit;
using TheUpperRoom.Application.Cities;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Infrastructure.Contacts;

namespace TheUpperRoom.Api.Contacts;

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
            var before = JsonSerializer.Serialize(ContactsMapping.ToContact(c));
            c.Name = request.Body.Name;
            _db.SaveChanges();
            var after = JsonSerializer.Serialize(ContactsMapping.ToContact(c));
            AuditStore.Record(user.Id, "Contact", request.Id, "Update", before, after);
        }

        return Task.FromResult(new MutateContactResult(ContactsMapping.ToContact(c), ContactsOutcome.Ok, null));
    }
}
