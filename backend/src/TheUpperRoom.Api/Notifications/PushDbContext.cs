// Traces to: TASK-0230
using Microsoft.EntityFrameworkCore;

namespace TheUpperRoom.Api.Notifications;

public sealed class PushDbContext(DbContextOptions<PushDbContext> options) : DbContext(options)
{
    public DbSet<PushSubscriptionRow> Subscriptions => Set<PushSubscriptionRow>();
    public DbSet<PendingPushRow> PendingPushes => Set<PendingPushRow>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        var s = b.Entity<PushSubscriptionRow>();
        s.ToTable("PushSubscriptions");
        s.HasKey(x => x.UserId);
        s.Property(x => x.UserId).HasMaxLength(100);
        s.Property(x => x.Endpoint).HasMaxLength(2048).IsRequired();
        s.Property(x => x.P256dh).HasMaxLength(500);
        s.Property(x => x.Auth).HasMaxLength(500);

        var p = b.Entity<PendingPushRow>();
        p.ToTable("PendingPushes");
        p.HasKey(x => x.Id);
        p.Property(x => x.UserId).HasMaxLength(100).IsRequired();
        p.Property(x => x.Title).HasMaxLength(500).IsRequired();
    }
}
