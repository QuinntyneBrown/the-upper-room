using Microsoft.EntityFrameworkCore;

namespace TheUpperRoom.Application.Events;

public interface IEventsDbContext
{
    DbSet<EventRow> Events { get; }
    DbSet<RsvpRow> Rsvps { get; }

    int SaveChanges();
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
