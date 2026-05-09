// Traces to: TASK-0226
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace TheUpperRoom.Api.Notes;

public sealed class NotesDbContext(DbContextOptions<NotesDbContext> options) : DbContext(options)
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

public sealed class NoteRow
{
    public string Id { get; set; } = "";
    public string SubjectType { get; set; } = "";
    public string SubjectId { get; set; } = "";
    public string BodyMarkdown { get; set; } = "";
    public string BodyHtmlSanitized { get; set; } = "";
    public string CreatedBy { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; }
    public string UpdatedBy { get; set; } = "";
    public DateTimeOffset UpdatedAt { get; set; }
    public List<NoteHistoryEntry> History { get; set; } = new();
}

public sealed record NoteHistoryEntry(
    string Id,
    string BodyMarkdown,
    string BodyHtmlSanitized,
    DateTimeOffset CreatedAt,
    string CreatedBy);
