namespace TheUpperRoom.Application.Notifications;

public sealed class NotificationRow
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string UserId { get; set; } = "";
    public string Code { get; set; } = "";
    public string Title { get; set; } = "";
    public string Body { get; set; } = "";
    public Dictionary<string, string> Data { get; set; } = new();
    public bool Read { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public string? DeepLink { get; set; }
    public string Severity { get; set; } = "Info";
}
