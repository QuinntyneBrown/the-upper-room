using Microsoft.EntityFrameworkCore;

namespace TheUpperRoom.Application.Notes;

public interface INotesDbContext
{
    DbSet<NoteRow> Notes { get; }

    int SaveChanges();
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
