using Microsoft.EntityFrameworkCore;

namespace TheUpperRoom.Application.Kanban;

public interface IKanbanDbContext
{
    DbSet<BoardRow> Boards { get; }
    DbSet<BoardColumnRow> Columns { get; }
    DbSet<CardRow> Cards { get; }

    int SaveChanges();
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
