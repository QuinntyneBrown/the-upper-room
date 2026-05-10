namespace TheUpperRoom.Application.Notifications;

public sealed record NotificationPreferenceDto(string Code, bool InApp, bool Email, bool Push);
