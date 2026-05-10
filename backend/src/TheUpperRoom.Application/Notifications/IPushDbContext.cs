using Microsoft.EntityFrameworkCore;

namespace TheUpperRoom.Application.Notifications;

public interface IPushDbContext
{
    DbSet<PushSubscriptionRow> Subscriptions { get; }
    DbSet<PendingPushRow> PendingPushes { get; }

    int SaveChanges();
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
