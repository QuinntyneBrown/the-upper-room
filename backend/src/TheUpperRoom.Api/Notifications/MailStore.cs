// traces_to: L2-063
// Traces to: TASK-0229
namespace TheUpperRoom.Api.Notifications;

public sealed class MailStore(NotificationsDbContext db)
{
    public void Send(string toUserId, string subject, string body)
    {
        db.SentMail.Add(new SentMailRow
        {
            ToUserId = toUserId,
            Subject = subject,
            Body = body,
            SentAt = DateTimeOffset.UtcNow,
        });
        db.SaveChanges();
        WriteToFile(toUserId, subject, body);
    }

    public IEnumerable<SentMailRow> Sent => db.SentMail.OrderBy(m => m.SentAt);

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
