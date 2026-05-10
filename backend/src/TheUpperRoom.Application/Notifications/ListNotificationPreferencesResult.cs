namespace TheUpperRoom.Application.Notifications;

public sealed record ListNotificationPreferencesResult(IReadOnlyList<NotificationPreferenceDto> Items, NotificationsOutcome Outcome);
