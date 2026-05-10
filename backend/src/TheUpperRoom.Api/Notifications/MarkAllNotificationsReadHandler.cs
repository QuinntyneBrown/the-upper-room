using MediatR;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Api.Notifications;

internal sealed class MarkAllNotificationsReadHandler : IRequestHandler<MarkAllNotificationsReadCommand, NotificationsOutcome>
{
    private readonly NotificationsDbContext _db;
    private readonly IUserDirectory _users;

    public MarkAllNotificationsReadHandler(NotificationsDbContext db, IUserDirectory users)
    {
        _db = db;
        _users = users;
    }

    public Task<NotificationsOutcome> Handle(MarkAllNotificationsReadCommand request, CancellationToken cancellationToken)
    {
        var user = _users.GetById(request.UserId);
        if (user is null) return Task.FromResult(NotificationsOutcome.Unauthorized);

        foreach (var n in _db.Notifications.Where(x => x.UserId == user.Id && !x.Read))
            n.Read = true;
        _db.SaveChanges();
        return Task.FromResult(NotificationsOutcome.NoContent);
    }
}
