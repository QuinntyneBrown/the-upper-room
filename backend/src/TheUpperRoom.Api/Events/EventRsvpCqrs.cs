using MediatR;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Api.Events;

public enum RsvpOutcome
{
    Ok,
    Unauthorized,
    NotFound,
    BadRequest,
}

public sealed record GetMyRsvpQuery(string UserId, string EventId) : IRequest<GetMyRsvpResult>;
public sealed record GetMyRsvpResult(string? Status, int? WaitlistPosition, RsvpOutcome Outcome);

public sealed record SubmitRsvpCommand(string UserId, string EventId, RsvpRequest? Body) : IRequest<SubmitRsvpResult>;
public sealed record SubmitRsvpResult(RsvpResponse? Response, RsvpOutcome Outcome);

public sealed record GetRsvpRequestsQuery(string UserId, string EventId) : IRequest<GetRsvpRequestsResult>;
public sealed record GetRsvpRequestsResult(PendingRsvpDto[] Items, RsvpOutcome Outcome);

public sealed record ApproveRsvpCommand(string UserId, string EventId, string RsvpUserId) : IRequest<RsvpOutcome>;
public sealed record DenyRsvpCommand(string UserId, string EventId, string RsvpUserId) : IRequest<RsvpOutcome>;

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

internal sealed class SubmitRsvpHandler : IRequestHandler<SubmitRsvpCommand, SubmitRsvpResult>
{
    private readonly EventsDbContext _db;
    private readonly IUserDirectory _users;

    public SubmitRsvpHandler(EventsDbContext db, IUserDirectory users)
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

internal sealed class ApproveRsvpHandler : IRequestHandler<ApproveRsvpCommand, RsvpOutcome>
{
    private readonly EventsDbContext _db;
    private readonly IUserDirectory _users;

    public ApproveRsvpHandler(EventsDbContext db, IUserDirectory users)
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
