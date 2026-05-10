// Traces to: TASK-0230
namespace TheUpperRoom.Application.Notifications;

public sealed class PushDispatcher(IPushDbContext db)
{
    public void Enqueue(string userId, string title, string body)
    {
        if (db.Subscriptions.Find(userId) is null) return;
        db.PendingPushes.Add(new PendingPushRow
        {
            UserId = userId,
            Title = title,
            Body = body,
        });
        db.SaveChanges();
    }
}
