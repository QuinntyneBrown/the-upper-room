using MediatR;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Application.Events;

internal sealed class ApproveRsvpHandler : IRequestHandler<ApproveRsvpCommand, RsvpOutcome>
{
    private readonly IEventsDbContext _db;
    private readonly IUserDirectory _users;

    public ApproveRsvpHandler(IEventsDbContext db, IUserDirectory users)
    {
        _db = db;
        _users = users;
    }

    public Task<RsvpOutcome> Handle(ApproveRsvpCommand request, CancellationToken cancellationToken)
    {
        if (_users.GetById(request.UserId) is null) return Task.FromResult(RsvpOutcome.Unauthorized);
        var rsvp = _db.Rsvps.Find(request.EventId, request.RsvpUserId);
        if (rsvp is null || rsvp.Status != "PendingApproval") return Task.FromResult(RsvpOutcome.NotFound);
        rsvp.Status = "Going";
        rsvp.WaitlistPosition = null;
        _db.SaveChanges();
        return Task.FromResult(RsvpOutcome.Ok);
    }
}
