using MediatR;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Infrastructure.Events;

namespace TheUpperRoom.Api.Events;

internal sealed class DenyRsvpHandler : IRequestHandler<DenyRsvpCommand, RsvpOutcome>
{
    private readonly EventsDbContext _db;
    private readonly IUserDirectory _users;

    public DenyRsvpHandler(EventsDbContext db, IUserDirectory users)
    {
        _db = db;
        _users = users;
    }

    public Task<RsvpOutcome> Handle(DenyRsvpCommand request, CancellationToken cancellationToken)
    {
        if (_users.GetById(request.UserId) is null) return Task.FromResult(RsvpOutcome.Unauthorized);
        var rsvp = _db.Rsvps.Find(request.EventId, request.RsvpUserId);
        if (rsvp is null || rsvp.Status != "PendingApproval") return Task.FromResult(RsvpOutcome.NotFound);
        _db.Rsvps.Remove(rsvp);
        _db.SaveChanges();
        return Task.FromResult(RsvpOutcome.Ok);
    }
}
