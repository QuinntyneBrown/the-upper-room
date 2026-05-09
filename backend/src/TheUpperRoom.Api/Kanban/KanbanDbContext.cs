// Traces to: TASK-0228
using Microsoft.EntityFrameworkCore;

namespace TheUpperRoom.Api.Kanban;

public sealed class KanbanDbContext(DbContextOptions<KanbanDbContext> options) : DbContext(options)
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

public sealed class BoardRow
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public DateTimeOffset LastActivityAt { get; set; } = DateTimeOffset.UtcNow;
    public string SwimlaneMode { get; set; } = "None";
}

public sealed class BoardColumnRow
{
    public string Id { get; set; } = "";
    public string BoardId { get; set; } = "";
    public string Name { get; set; } = "";
    public string Color { get; set; } = "blue";
    public int? WipLimit { get; set; }
    public int ColumnOrder { get; set; }
}

public sealed class CardRow
{
    public string Id { get; set; } = "";
    public string BoardId { get; set; } = "";
    public string ColumnId { get; set; } = "";
    public string Title { get; set; } = "";
    public string? AssigneeName { get; set; }
    public string? DueDate { get; set; }
    public int CardOrder { get; set; }
}
