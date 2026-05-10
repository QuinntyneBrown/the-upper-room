using MediatR;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Application.Notifications;

internal sealed class UpsertNotificationPreferenceHandler : IRequestHandler<UpsertNotificationPreferenceCommand, UpsertNotificationPreferenceResult>
{
    private readonly INotificationsDbContext _db;
    private readonly IUserDirectory _users;

    public UpsertNotificationPreferenceHandler(INotificationsDbContext db, IUserDirectory users)
    {
        _db = db;
        _users = users;
    }

    public Task<UpsertNotificationPreferenceResult> Handle(UpsertNotificationPreferenceCommand request, CancellationToken cancellationToken)
    {
        var user = _users.GetById(request.UserId);
        if (user is null) return Task.FromResult(new UpsertNotificationPreferenceResult(null, NotificationsOutcome.Unauthorized));
        if (request.Body is null) return Task.FromResult(new UpsertNotificationPreferenceResult(null, NotificationsOutcome.BadRequest));

        var existing = _db.Preferences.Find(user.Id, request.Body.Code);
        if (existing is not null)
        {
            existing.InApp = request.Body.InApp;
            existing.Email = request.Body.Email;
            existing.Push = request.Body.Push;
        }
        else
        {
            _db.Preferences.Add(new PreferenceRow
            {
                UserId = user.Id,
                Code = request.Body.Code,
                InApp = request.Body.InApp,
                Email = request.Body.Email,
                Push = request.Body.Push,
            });
        }
        _db.SaveChanges();

        return Task.FromResult(new UpsertNotificationPreferenceResult(
            new { userId = user.Id, code = request.Body.Code, inApp = request.Body.InApp, email = request.Body.Email, push = request.Body.Push },
            NotificationsOutcome.Ok));
    }
}
