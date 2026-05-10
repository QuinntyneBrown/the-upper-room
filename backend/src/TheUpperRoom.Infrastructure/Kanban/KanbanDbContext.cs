// Traces to: TASK-0228
using Microsoft.EntityFrameworkCore;
using TheUpperRoom.Application.Kanban;

namespace TheUpperRoom.Infrastructure.Kanban;

public sealed class KanbanDbContext(DbContextOptions<KanbanDbContext> options)
    : DbContext(options), IKanbanDbContext
{
    public DbSet<BoardRow> Boards => Set<BoardRow>();
    public DbSet<BoardColumnRow> Columns => Set<BoardColumnRow>();
    public DbSet<CardRow> Cards => Set<CardRow>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        var board = b.Entity<BoardRow>();
        board.ToTable("Boards");
        board.HasKey(x => x.Id);
        board.Property(x => x.Id).HasMaxLength(64);
        board.Property(x => x.Name).HasMaxLength(200).IsRequired();
        board.Property(x => x.Description).HasMaxLength(1000);
        board.Property(x => x.SwimlaneMode).HasMaxLength(50);

        var col = b.Entity<BoardColumnRow>();
        col.ToTable("BoardColumns");
        col.HasKey(x => x.Id);
        col.Property(x => x.Id).HasMaxLength(64);
        col.Property(x => x.BoardId).HasMaxLength(64).IsRequired();
        col.Property(x => x.Name).HasMaxLength(200).IsRequired();
        col.Property(x => x.Color).HasMaxLength(50);

        var card = b.Entity<CardRow>();
        card.ToTable("Cards");
        card.HasKey(x => x.Id);
        card.Property(x => x.Id).HasMaxLength(64);
        card.Property(x => x.BoardId).HasMaxLength(64).IsRequired();
        card.Property(x => x.ColumnId).HasMaxLength(64).IsRequired();
        card.Property(x => x.Title).HasMaxLength(500).IsRequired();
        card.Property(x => x.AssigneeName).HasMaxLength(200);
        card.Property(x => x.DueDate).HasMaxLength(20);
    }
}
