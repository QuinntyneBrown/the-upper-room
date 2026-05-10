// Traces to: TASK-0225
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace TheUpperRoom.Api.Ideas;

public sealed class IdeasDbContext(DbContextOptions<IdeasDbContext> options) : DbContext(options)
{
    public DbSet<IdeaRow> Ideas => Set<IdeaRow>();
    public DbSet<IdeaVoteRow> Votes => Set<IdeaVoteRow>();
    public DbSet<IdeaPartnerRow> Partners => Set<IdeaPartnerRow>();
    public DbSet<IdeaCommentRow> Comments => Set<IdeaCommentRow>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        var jsonStringArray = new ValueConverter<string[], string>(
            v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
            v => JsonSerializer.Deserialize<string[]>(v, (JsonSerializerOptions?)null) ?? Array.Empty<string>());

        var i = b.Entity<IdeaRow>();
        i.ToTable("Ideas");
        i.HasKey(x => x.Id);
        i.Property(x => x.Title).HasMaxLength(300).IsRequired();
        i.Property(x => x.Status).HasMaxLength(50).IsRequired();
        i.Property(x => x.ProposedBy).HasMaxLength(100).IsRequired();
        i.Property(x => x.Tags).HasConversion(jsonStringArray);

        var v = b.Entity<IdeaVoteRow>();
        v.ToTable("IdeaVotes");
        v.HasKey(x => new { x.IdeaId, x.UserId });
        v.Property(x => x.IdeaId).HasMaxLength(100);
        v.Property(x => x.UserId).HasMaxLength(100);

        var p = b.Entity<IdeaPartnerRow>();
        p.ToTable("IdeaPartners");
        p.HasKey(x => new { x.IdeaId, x.PartnerId });
        p.Property(x => x.IdeaId).HasMaxLength(100);
        p.Property(x => x.PartnerId).HasMaxLength(100);
        p.Property(x => x.PartnerName).HasMaxLength(200).IsRequired();

        var c = b.Entity<IdeaCommentRow>();
        c.ToTable("IdeaComments");
        c.HasKey(x => x.Id);
        c.Property(x => x.Id).HasMaxLength(100);
        c.Property(x => x.IdeaId).HasMaxLength(100).IsRequired();
        c.Property(x => x.Author).HasMaxLength(100).IsRequired();
        c.Property(x => x.Body).HasMaxLength(4000).IsRequired();
        c.HasIndex(x => x.IdeaId);
    }
}

public sealed class IdeaRow
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string BodyMarkdown { get; set; } = "";
    public string BodyHtmlSanitized { get; set; } = "";
    public string? CoverImageUrl { get; set; }
    public string Status { get; set; } = "Draft";
    public string ProposedBy { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public string[] Tags { get; set; } = Array.Empty<string>();
}

public sealed class IdeaVoteRow
{
    public string IdeaId { get; set; } = "";
    public string UserId { get; set; } = "";
}

public sealed class IdeaPartnerRow
{
    public string IdeaId { get; set; } = "";
    public string PartnerId { get; set; } = "";
    public string PartnerName { get; set; } = "";
}

public sealed class IdeaCommentRow
{
    public string Id { get; set; } = "";
    public string IdeaId { get; set; } = "";
    public string Author { get; set; } = "";
    public string Body { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; }
}
