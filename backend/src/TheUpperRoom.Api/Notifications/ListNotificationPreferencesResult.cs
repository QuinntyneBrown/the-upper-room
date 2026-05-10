namespace TheUpperRoom.Api.Notifications;

public sealed record ListNotificationPreferencesResult(IReadOnlyList<NotificationPreferenceDto> Items, NotificationsOutcome Outcome);
