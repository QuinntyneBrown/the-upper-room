using MediatR;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Domain.Notifications;

namespace TheUpperRoom.Application.Notifications;

internal sealed class ListNotificationPreferencesHandler : IRequestHandler<ListNotificationPreferencesQuery, ListNotificationPreferencesResult>
{
    private readonly INotificationsDbContext _db;
    private readonly IUserDirectory _users;

    public ListNotificationPreferencesHandler(INotificationsDbContext db, IUserDirectory users)
    {
        _db = db;
        _users = users;
    }

    public Task<ListNotificationPreferencesResult> Handle(ListNotificationPreferencesQuery request, CancellationToken cancellationToken)
    {
        var user = _users.GetById(request.UserId);
        if (user is null)
            return Task.FromResult(new ListNotificationPreferencesResult(Array.Empty<NotificationPreferenceDto>(), NotificationsOutcome.Unauthorized));

        var stored = _db.Preferences.Where(p => p.UserId == user.Id).ToList();

        var result = NotificationCatalog.All.Select(t =>
        {
            var s = stored.FirstOrDefault(p => p.Code == t.Code);
            return new NotificationPreferenceDto(t.Code, s?.InApp ?? true, s?.Email ?? true, s?.Push ?? false);
        }).ToList();

        return Task.FromResult(new ListNotificationPreferencesResult(result, NotificationsOutcome.Ok));
    }
}
