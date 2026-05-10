// Traces to: TASK-0229
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace TheUpperRoom.Api.Notifications;

public sealed class NotificationsDbContext(DbContextOptions<NotificationsDbContext> options) : DbContext(options)
{
    public DbSet<NotificationRow> Notifications => Set<NotificationRow>();
    public DbSet<PreferenceRow> Preferences => Set<PreferenceRow>();
    public DbSet<SentMailRow> SentMail => Set<SentMailRow>();
    public DbSet<DigestPreferenceRow> DigestPreferences => Set<DigestPreferenceRow>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        var dataConverter = new ValueConverter<Dictionary<string, string>, string>(
            v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
            v => JsonSerializer.Deserialize<Dictionary<string, string>>(v, (JsonSerializerOptions?)null) ?? new());

        var n = b.Entity<NotificationRow>();
        n.ToTable("Notifications");
        n.HasKey(x => x.Id);
        n.Property(x => x.Id).HasMaxLength(64);
        n.Property(x => x.UserId).HasMaxLength(100).IsRequired();
        n.Property(x => x.Code).HasMaxLength(100).IsRequired();
        n.Property(x => x.Title).HasMaxLength(500).IsRequired();
        n.Property(x => x.Severity).HasMaxLength(50).IsRequired();
        n.Property(x => x.DeepLink).HasMaxLength(500);
        n.Property(x => x.Data).HasConversion(dataConverter);

        var p = b.Entity<PreferenceRow>();
        p.ToTable("Preferences");
        p.HasKey(x => new { x.UserId, x.Code });
        p.Property(x => x.UserId).HasMaxLength(100);
        p.Property(x => x.Code).HasMaxLength(100);

        var m = b.Entity<SentMailRow>();
        m.ToTable("SentMail");
        m.HasKey(x => x.Id);
        m.Property(x => x.ToUserId).HasMaxLength(100).IsRequired();
        m.Property(x => x.Subject).HasMaxLength(500).IsRequired();

        var d = b.Entity<DigestPreferenceRow>();
        d.ToTable("DigestPreferences");
        d.HasKey(x => x.UserId);
        d.Property(x => x.UserId).HasMaxLength(100);
        d.Property(x => x.Frequency).HasMaxLength(20).IsRequired();
    }
}

public sealed class NotificationRow
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string UserId { get; set; } = "";
    public string Code { get; set; } = "";
    public string Title { get; set; } = "";
    public string Body { get; set; } = "";
    public Dictionary<string, string> Data { get; set; } = new();
    public bool Read { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public string? DeepLink { get; set; }
    public string Severity { get; set; } = "Info";
}

public sealed class PreferenceRow
{
    public string UserId { get; set; } = "";
    public string Code { get; set; } = "";
    public bool InApp { get; set; } = true;
    public bool Email { get; set; } = true;
    public bool Push { get; set; }
}

public sealed class SentMailRow
{
    public int Id { get; set; }
    public string ToUserId { get; set; } = "";
    public string Subject { get; set; } = "";
    public string Body { get; set; } = "";
    public DateTimeOffset SentAt { get; set; }
}

public sealed class DigestPreferenceRow
{
    public string UserId { get; set; } = "";
    public string Frequency { get; set; } = "off";
}
