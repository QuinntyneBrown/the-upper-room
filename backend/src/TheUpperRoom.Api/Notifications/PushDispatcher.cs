// Traces to: TASK-0230
using TheUpperRoom.Infrastructure.Notifications;

namespace TheUpperRoom.Api.Notifications;

public sealed class PushDispatcher(PushDbContext db)
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
