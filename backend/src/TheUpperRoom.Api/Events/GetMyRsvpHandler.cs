using MediatR;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Infrastructure.Events;

namespace TheUpperRoom.Api.Events;

internal sealed class GetMyRsvpHandler : IRequestHandler<GetMyRsvpQuery, GetMyRsvpResult>
{
    private readonly EventsDbContext _db;
    private readonly IUserDirectory _users;

    public GetMyRsvpHandler(EventsDbContext db, IUserDirectory users)
    {
        _db = db;
        _users = users;
    }

    public Task<GetMyRsvpResult> Handle(GetMyRsvpQuery request, CancellationToken cancellationToken)
    {
        var user = _users.GetById(request.UserId);
        if (user is null) return Task.FromResult(new GetMyRsvpResult(null, null, RsvpOutcome.Unauthorized));

        var rsvp = _db.Rsvps.Find(request.EventId, user.Id);
        return Task.FromResult(rsvp is null
            ? new GetMyRsvpResult(null, null, RsvpOutcome.Ok)
            : new GetMyRsvpResult(rsvp.Status, rsvp.WaitlistPosition, RsvpOutcome.Ok));
    }
}
