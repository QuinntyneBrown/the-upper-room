using MediatR;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Api.Events;

internal sealed class CancelEventHandler : IRequestHandler<CancelEventCommand, CancelEventResult>
{
    private readonly EventsDbContext _db;
    private readonly IUserDirectory _users;

    public CancelEventHandler(EventsDbContext db, IUserDirectory users)
    {
        _db = db;
        _users = users;
    }

    public Task<CancelEventResult> Handle(CancelEventCommand request, CancellationToken cancellationToken)
    {
        if (_users.GetById(request.UserId) is null)
            return Task.FromResult(new CancelEventResult(null, CancelEventOutcome.Unauthorized));

        var row = _db.Events.Find(request.EventId);
        if (row is null)
            return Task.FromResult(new CancelEventResult(null, CancelEventOutcome.NotFound));

        row.Status = "Cancelled";
        _db.SaveChanges();
        return Task.FromResult(new CancelEventResult(row.ToDto(), CancelEventOutcome.Cancelled));
    }
}
