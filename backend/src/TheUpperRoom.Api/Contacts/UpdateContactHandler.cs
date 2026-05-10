using System.Text.Json;
using MediatR;
using TheUpperRoom.Application.Audit;
using TheUpperRoom.Application.Cities;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Infrastructure.Contacts;

namespace TheUpperRoom.Api.Contacts;

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

        var before = JsonSerializer.Serialize(ContactsMapping.ToContact(c));
        c.Name = ContactsDisplayName.Build(request.Body);
        _db.SaveChanges();
        var after = JsonSerializer.Serialize(ContactsMapping.ToContact(c));
        AuditStore.Record(user.Id, "Contact", request.Id, "Update", before, after);
        return Task.FromResult(new MutateContactResult(ContactsMapping.ToContact(c), ContactsOutcome.Ok, null));
    }
}
