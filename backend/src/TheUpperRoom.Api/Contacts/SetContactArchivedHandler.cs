using System.Text.Json;
using MediatR;
using TheUpperRoom.Api.Audit;
using TheUpperRoom.Application.Cities;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Infrastructure.Contacts;

namespace TheUpperRoom.Api.Contacts;

internal sealed class SetContactArchivedHandler : IRequestHandler<SetContactArchivedCommand, MutateContactResult>
{
    private readonly ContactsDbContext _db;
    private readonly IUserDirectory _users;

    public SetContactArchivedHandler(ContactsDbContext db, IUserDirectory users)
    {
        _db = db;
        _users = users;
    }

    public Task<MutateContactResult> Handle(SetContactArchivedCommand request, CancellationToken cancellationToken)
    {
        var user = _users.GetById(request.UserId);
        if (user is null) return Task.FromResult(new MutateContactResult(null, ContactsOutcome.Unauthorized, null));

        var c = _db.Contacts.Find(request.Id);
        if (c is null) return Task.FromResult(new MutateContactResult(null, ContactsOutcome.NotFound, null));
        if (CityScope.VisibleOrNull(c, user.City) is null)
            return Task.FromResult(new MutateContactResult(null, ContactsOutcome.NotFound, null));

        if (c.IsArchived != request.Archived)
        {
            var before = JsonSerializer.Serialize(new { c.Id, c.Name, c.CityId, c.IsArchived });
            c.IsArchived = request.Archived;
            _db.SaveChanges();
            var after = JsonSerializer.Serialize(new { c.Id, c.Name, c.CityId, c.IsArchived });
            AuditStore.Record(user.Id, "Contact", request.Id, request.Archived ? "Archive" : "Unarchive", before, after);
        }

        return Task.FromResult(new MutateContactResult(null, ContactsOutcome.NoContent, null));
    }
}
