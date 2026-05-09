using MediatR;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Domain.Notifications;

namespace TheUpperRoom.Api.Notifications;

public enum NotificationsOutcome
{
    Ok,
    NoContent,
    Unauthorized,
    BadRequest,
    NotFound,
    Unprocessable,
}

public sealed record ListNotificationsQuery(string UserId) : IRequest<ListNotificationsResult>;
public sealed record ListNotificationsResult(NotificationDto[] Items, NotificationsOutcome Outcome);

public sealed record MarkNotificationReadCommand(string UserId, string Id) : IRequest<MarkNotificationReadResult>;
public sealed record MarkNotificationReadResult(NotificationDto? Notification, NotificationsOutcome Outcome);

public sealed record MarkAllNotificationsReadCommand(string UserId) : IRequest<NotificationsOutcome>;

public sealed record DispatchNotificationCommand(string UserId, DispatchRequest? Body) : IRequest<DispatchNotificationResult>;
public sealed record DispatchNotificationResult(NotificationsOutcome Outcome, string? Error);

public sealed record ListNotificationPreferencesQuery(string UserId) : IRequest<ListNotificationPreferencesResult>;
public sealed record ListNotificationPreferencesResult(IReadOnlyList<NotificationPreferenceDto> Items, NotificationsOutcome Outcome);
public sealed record NotificationPreferenceDto(string Code, bool InApp, bool Email, bool Push);

public sealed record UpsertNotificationPreferenceCommand(string UserId, UpsertPreferenceRequest? Body) : IRequest<UpsertNotificationPreferenceResult>;
public sealed record UpsertNotificationPreferenceResult(object? Payload, NotificationsOutcome Outcome);

internal static class NotificationMapping
{
    public static NotificationDto ToDto(NotificationRow n) =>
        new(n.Id, n.Code, n.Title, n.Body, n.Data, n.Read, n.CreatedAt, n.DeepLink, n.Severity);

    public static string Render(string template, Dictionary<string, string> data) =>
        data.Aggregate(template, (t, kv) => t.Replace("{" + kv.Key + "}", kv.Value));
}

internal sealed class ListNotificationsHandler : IRequestHandler<ListNotificationsQuery, ListNotificationsResult>
{
    private readonly NotificationsDbContext _db;
    private readonly IUserDirectory _users;

    public ListNotificationsHandler(NotificationsDbContext db, IUserDirectory users)
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

internal sealed class ListNotificationPreferencesHandler : IRequestHandler<ListNotificationPreferencesQuery, ListNotificationPreferencesResult>
{
    private readonly NotificationsDbContext _db;
    private readonly IUserDirectory _users;

    public ListNotificationPreferencesHandler(NotificationsDbContext db, IUserDirectory users)
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

internal sealed class UpsertNotificationPreferenceHandler : IRequestHandler<UpsertNotificationPreferenceCommand, UpsertNotificationPreferenceResult>
{
    private readonly NotificationsDbContext _db;
    private readonly IUserDirectory _users;

    public UpsertNotificationPreferenceHandler(NotificationsDbContext db, IUserDirectory users)
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
