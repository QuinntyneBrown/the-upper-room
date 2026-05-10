namespace TheUpperRoom.Application.Notifications;

public sealed record DispatchNotificationResult(NotificationsOutcome Outcome, string? Error);
