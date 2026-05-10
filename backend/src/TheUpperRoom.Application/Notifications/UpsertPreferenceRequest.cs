namespace TheUpperRoom.Application.Notifications;

public sealed record UpsertPreferenceRequest(string Code, bool InApp, bool Email, bool Push);
