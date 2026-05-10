namespace TheUpperRoom.Application.Notifications;

public sealed record DispatchRequest(string Code, string[] RecipientIds, Dictionary<string, string>? Data);
