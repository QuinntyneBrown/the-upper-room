using Microsoft.EntityFrameworkCore;

namespace TheUpperRoom.Application.Contacts;

public interface IContactsDbContext
{
    DbSet<ContactRow> Contacts { get; }

    int SaveChanges();
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
