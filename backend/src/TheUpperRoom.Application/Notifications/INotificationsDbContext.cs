using Microsoft.EntityFrameworkCore;

namespace TheUpperRoom.Application.Notifications;

public interface INotificationsDbContext
{
    DbSet<NotificationRow> Notifications { get; }
    DbSet<PreferenceRow> Preferences { get; }
    DbSet<SentMailRow> SentMail { get; }
    DbSet<DigestPreferenceRow> DigestPreferences { get; }

    int SaveChanges();
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
