using MediatR;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Domain.Notifications;
using TheUpperRoom.Infrastructure.Notifications;

namespace TheUpperRoom.Api.Notifications;

internal sealed class DispatchNotificationHandler : IRequestHandler<DispatchNotificationCommand, DispatchNotificationResult>
{
    private readonly NotificationsDbContext _db;
    private readonly MailStore _mail;
    private readonly PushDispatcher _push;
    private readonly IUserDirectory _users;

    public DispatchNotificationHandler(
        NotificationsDbContext db,
        MailStore mail,
        PushDispatcher push,
        IUserDirectory users)
    {
        _db = db;
        _mail = mail;
        _push = push;
        _users = users;
    }

    public Task<DispatchNotificationResult> Handle(DispatchNotificationCommand request, CancellationToken cancellationToken)
    {
        if (_users.GetById(request.UserId) is null)
            return Task.FromResult(new DispatchNotificationResult(NotificationsOutcome.Unauthorized, null));
        if (request.Body is null)
            return Task.FromResult(new DispatchNotificationResult(NotificationsOutcome.BadRequest, null));

        var type = NotificationCatalog.All.FirstOrDefault(t => t.Code == request.Body.Code);
        if (type is null)
            return Task.FromResult(new DispatchNotificationResult(NotificationsOutcome.Unprocessable, $"Unknown notification code '{request.Body.Code}'."));

        var data = request.Body.Data ?? new();

        foreach (var recipientId in request.Body.RecipientIds)
        {
            var pref = _db.Preferences.Find(recipientId, request.Body.Code);
            var subject = NotificationMapping.Render(type.Title, data);
            var bodyText = NotificationMapping.Render(type.BodyTemplate, data);

            if (pref is null || pref.InApp)
            {
                _db.Notifications.Add(new NotificationRow
                {
                    UserId = recipientId,
                    Code = request.Body.Code,
                    Title = subject,
                    Body = bodyText,
                    Data = data,
                    Read = false,
                    CreatedAt = DateTimeOffset.UtcNow,
                    Severity = type.Severity.ToString(),
                });
            }

            if (pref is null || pref.Email)
                _mail.Send(recipientId, subject, bodyText);

            if (pref?.Push == true)
                _push.Enqueue(recipientId, subject, bodyText);
        }

        _db.SaveChanges();
        return Task.FromResult(new DispatchNotificationResult(NotificationsOutcome.NoContent, null));
    }
}
