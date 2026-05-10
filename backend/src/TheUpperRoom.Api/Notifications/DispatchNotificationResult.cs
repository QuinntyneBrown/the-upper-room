namespace TheUpperRoom.Api.Notifications;

public sealed record DispatchNotificationResult(NotificationsOutcome Outcome, string? Error);
