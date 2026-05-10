namespace TheUpperRoom.Api.Notifications;

public sealed class SentMailRow
{
    public int Id { get; set; }
    public string ToUserId { get; set; } = "";
    public string Subject { get; set; } = "";
    public string Body { get; set; } = "";
    public DateTimeOffset SentAt { get; set; }
}
