using MediatR;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Application.Events;

internal sealed class SubmitRsvpHandler : IRequestHandler<SubmitRsvpCommand, SubmitRsvpResult>
{
    private readonly IEventsDbContext _db;
    private readonly IUserDirectory _users;

    public SubmitRsvpHandler(IEventsDbContext db, IUserDirectory users)
    {
        _db = db;
        _users = users;
    }

    public Task<SubmitRsvpResult> Handle(SubmitRsvpCommand request, CancellationToken cancellationToken)
    {
        var user = _users.GetById(request.UserId);
        if (user is null) return Task.FromResult(new SubmitRsvpResult(null, RsvpOutcome.Unauthorized));
        if (request.Body is null) return Task.FromResult(new SubmitRsvpResult(null, RsvpOutcome.BadRequest));

        var ev = _db.Events.Find(request.EventId);
        if (ev is null) return Task.FromResult(new SubmitRsvpResult(null, RsvpOutcome.NotFound));

        var existing = _db.Rsvps.Find(request.EventId, user.Id);
        string? promotedUser = null;

        if (existing is not null)
        {
            if (existing.Status == "Going" && request.Body.Status == "No")
            {
                var waitlisted = _db.Rsvps.FirstOrDefault(r => r.EventId == request.EventId && r.Status == "Waitlisted");
                if (waitlisted is not null)
                {
                    waitlisted.Status = "Going";
                    waitlisted.WaitlistPosition = null;
                    promotedUser = waitlisted.UserId;
                }
            }
            _db.Rsvps.Remove(existing);
        }

        if (request.Body.Status == "No")
        {
            _db.SaveChanges();
            return Task.FromResult(new SubmitRsvpResult(new RsvpResponse("Cancelled", null, promotedUser), RsvpOutcome.Ok));
        }

        if (request.Body.Status == "Maybe")
        {
            _db.Rsvps.Add(new RsvpRow { EventId = request.EventId, UserId = user.Id, Status = "Maybe" });
            _db.SaveChanges();
            return Task.FromResult(new SubmitRsvpResult(new RsvpResponse("Maybe"), RsvpOutcome.Ok));
        }

        if (ev.RequiresApproval)
        {
            _db.Rsvps.Add(new RsvpRow { EventId = request.EventId, UserId = user.Id, Status = "PendingApproval" });
            _db.SaveChanges();
            return Task.FromResult(new SubmitRsvpResult(new RsvpResponse("PendingApproval"), RsvpOutcome.Ok));
        }

        var goingCount = _db.Rsvps.Count(r => r.EventId == request.EventId && r.Status == "Going");
        if (ev.Capacity.HasValue && goingCount >= ev.Capacity.Value)
        {
            var pos = _db.Rsvps.Count(r => r.EventId == request.EventId && r.Status == "Waitlisted") + 1;
            _db.Rsvps.Add(new RsvpRow { EventId = request.EventId, UserId = user.Id, Status = "Waitlisted", WaitlistPosition = pos });
            _db.SaveChanges();
            return Task.FromResult(new SubmitRsvpResult(new RsvpResponse("Waitlisted", pos), RsvpOutcome.Ok));
        }

        _db.Rsvps.Add(new RsvpRow { EventId = request.EventId, UserId = user.Id, Status = "Going" });
        _db.SaveChanges();
        return Task.FromResult(new SubmitRsvpResult(new RsvpResponse("Going"), RsvpOutcome.Ok));
    }
}
