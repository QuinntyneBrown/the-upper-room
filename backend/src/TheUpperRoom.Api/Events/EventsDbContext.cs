// Traces to: TASK-0224
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace TheUpperRoom.Api.Events;

public sealed class EventsDbContext(DbContextOptions<EventsDbContext> options) : DbContext(options)
{
    public DbSet<EventRow> Events => Set<EventRow>();
    public DbSet<RsvpRow> Rsvps => Set<RsvpRow>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        var jsonStringArray = new ValueConverter<string[], string>(
            v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
            v => JsonSerializer.Deserialize<string[]>(v, (JsonSerializerOptions?)null) ?? Array.Empty<string>());

        var e = b.Entity<EventRow>();
        e.ToTable("Events");
        e.HasKey(x => x.Id);
        e.Property(x => x.Title).HasMaxLength(300).IsRequired();
        e.Property(x => x.Status).HasMaxLength(50).IsRequired();
        e.Property(x => x.Location).HasMaxLength(500);
        e.Property(x => x.LocationId).HasMaxLength(64);
        e.Property(x => x.Description);
        e.Property(x => x.RecurrenceRule).HasMaxLength(500);
        e.Property(x => x.Timezone).HasMaxLength(100);
        e.Property(x => x.Tags).HasConversion(jsonStringArray);
        e.Property(x => x.ExceptionDates).HasConversion(jsonStringArray);

        var r = b.Entity<RsvpRow>();
        r.ToTable("Rsvps");
        r.HasKey(x => new { x.EventId, x.UserId });
        r.Property(x => x.EventId).HasMaxLength(100);
        r.Property(x => x.UserId).HasMaxLength(100);
        r.Property(x => x.Status).HasMaxLength(50).IsRequired();
    }
}

public sealed class EventRow
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public string Status { get; set; } = "Scheduled";
    public DateTimeOffset StartAt { get; set; }
    public DateTimeOffset EndAt { get; set; }
    public string? Location { get; set; }
    public string? LocationId { get; set; }
    public bool IsVirtual { get; set; }
    public int? Capacity { get; set; }
    public bool RequiresApproval { get; set; }
    public string? Description { get; set; }
    public string[] Tags { get; set; } = Array.Empty<string>();
    public string? RecurrenceRule { get; set; }
    public string[] ExceptionDates { get; set; } = Array.Empty<string>();
    public string? Timezone { get; set; }

    public EventDto ToDto(int rsvpCount = 0, IReadOnlyList<AttendeeDto>? attendees = null) => new(
        Id, Title, null, Status, StartAt, EndAt, Location, IsVirtual,
        rsvpCount, Capacity, Tags, Description, attendees,
        RequiresApproval, RecurrenceRule, null, null,
        ExceptionDates.Length == 0 ? null : ExceptionDates, Timezone);
}

public sealed class RsvpRow
{
    public string EventId { get; set; } = "";
    public string UserId { get; set; } = "";
    public string Status { get; set; } = "";
    public int? WaitlistPosition { get; set; }
}
