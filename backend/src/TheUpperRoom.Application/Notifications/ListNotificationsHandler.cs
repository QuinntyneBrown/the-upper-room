using MediatR;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Application.Notifications;

internal sealed class ListNotificationsHandler : IRequestHandler<ListNotificationsQuery, ListNotificationsResult>
{
    private readonly INotificationsDbContext _db;
    private readonly IUserDirectory _users;

    public ListNotificationsHandler(INotificationsDbContext db, IUserDirectory users)
    {
        _db = db;
        _users = users;
    }

    public Task<ListNotificationsResult> Handle(ListNotificationsQuery request, CancellationToken cancellationToken)
    {
        var user = _users.GetById(request.UserId);
        if (user is null) return Task.FromResult(new ListNotificationsResult(Array.Empty<NotificationDto>(), NotificationsOutcome.Unauthorized));

        var items = _db.Notifications
            .Where(n => n.UserId == user.Id)
            .AsEnumerable()
            .OrderByDescending(n => n.CreatedAt)
            .Select(NotificationMapping.ToDto)
            .ToArray();

        return Task.FromResult(new ListNotificationsResult(items, NotificationsOutcome.Ok));
    }
}
