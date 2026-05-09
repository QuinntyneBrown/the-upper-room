// traces_to: L2-063
namespace TheUpperRoom.Api.Notifications;

internal static class MailStore
{
    internal static readonly List<MailRecord> Sent = [];

    internal static void Send(string toUserId, string subject, string body)
    {
        Sent.Add(new MailRecord(toUserId, subject, body, DateTimeOffset.UtcNow));
        WriteToFile(toUserId, subject, body);
    }

    private static void WriteToFile(string toUserId, string subject, string body)
    {
        try
        {
            var dir = Path.Combine("var", "mail");
            Directory.CreateDirectory(dir);
            var ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            File.WriteAllText(Path.Combine(dir, $"{toUserId}_{ts}.txt"), $"Subject: {subject}\n\n{body}");
        }
        catch
        {
            // best-effort in dev
        }
    }
}

internal sealed record MailRecord(string ToUserId, string Subject, string Body, DateTimeOffset SentAt);
