using MediatR;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Api.Events;

internal sealed class GetRsvpRequestsHandler : IRequestHandler<GetRsvpRequestsQuery, GetRsvpRequestsResult>
{
    private readonly EventsDbContext _db;
    private readonly IUserDirectory _users;

    public GetRsvpRequestsHandler(EventsDbContext db, IUserDirectory users)
    {
        _db = db;
        _users = users;
    }

    public Task<GetRsvpRequestsResult> Handle(GetRsvpRequestsQuery request, CancellationToken cancellationToken)
    {
        if (_users.GetById(request.UserId) is null)
            return Task.FromResult(new GetRsvpRequestsResult(Array.Empty<PendingRsvpDto>(), RsvpOutcome.Unauthorized));

        var pending = _db.Rsvps
            .Where(r => r.EventId == request.EventId && r.Status == "PendingApproval")
            .Select(r => new PendingRsvpDto(r.UserId, r.UserId, $"User {r.UserId}", DateTimeOffset.UtcNow.ToString("O")))
            .ToArray();
        return Task.FromResult(new GetRsvpRequestsResult(pending, RsvpOutcome.Ok));
    }
}
