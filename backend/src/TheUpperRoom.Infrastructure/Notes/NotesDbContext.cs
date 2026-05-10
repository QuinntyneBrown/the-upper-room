// Traces to: TASK-0226
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using TheUpperRoom.Application.Notes;

namespace TheUpperRoom.Infrastructure.Notes;

public sealed class NotesDbContext(DbContextOptions<NotesDbContext> options)
    : DbContext(options), INotesDbContext
{
    public DbSet<NoteRow> Notes => Set<NoteRow>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        var historyConverter = new ValueConverter<List<NoteHistoryEntry>, string>(
            v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
            v => JsonSerializer.Deserialize<List<NoteHistoryEntry>>(v, (JsonSerializerOptions?)null) ?? new());

        var n = b.Entity<NoteRow>();
        n.ToTable("Notes");
        n.HasKey(x => x.Id);
        n.Property(x => x.SubjectType).HasMaxLength(50).IsRequired();
        n.Property(x => x.SubjectId).HasMaxLength(100).IsRequired();
        n.Property(x => x.CreatedBy).HasMaxLength(100).IsRequired();
        n.Property(x => x.UpdatedBy).HasMaxLength(100).IsRequired();
        n.Property(x => x.History).HasConversion(historyConverter);
    }
}
