using MediatR;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Api.Notifications;

internal sealed class MarkNotificationReadHandler : IRequestHandler<MarkNotificationReadCommand, MarkNotificationReadResult>
{
    private readonly NotificationsDbContext _db;
    private readonly IUserDirectory _users;

    public MarkNotificationReadHandler(NotificationsDbContext db, IUserDirectory users)
    {
        _db = db;
        _users = users;
    }

    public Task<MarkNotificationReadResult> Handle(MarkNotificationReadCommand request, CancellationToken cancellationToken)
    {
        var user = _users.GetById(request.UserId);
        if (user is null) return Task.FromResult(new MarkNotificationReadResult(null, NotificationsOutcome.Unauthorized));

        var n = _db.Notifications.FirstOrDefault(x => x.Id == request.Id && x.UserId == user.Id);
        if (n is null) return Task.FromResult(new MarkNotificationReadResult(null, NotificationsOutcome.NotFound));

        n.Read = true;
        _db.SaveChanges();
        return Task.FromResult(new MarkNotificationReadResult(NotificationMapping.ToDto(n), NotificationsOutcome.Ok));
    }
}
