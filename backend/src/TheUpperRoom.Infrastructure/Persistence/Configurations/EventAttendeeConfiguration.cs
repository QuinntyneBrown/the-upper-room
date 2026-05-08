using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheUpperRoom.Domain.Events;

namespace TheUpperRoom.Infrastructure.Persistence.Configurations;

internal sealed class EventAttendeeConfiguration : IEntityTypeConfiguration<EventAttendee>
{
    public void Configure(EntityTypeBuilder<EventAttendee> builder)
    {
        builder.ToTable("EventAttendees");
        builder.ConfigureEntityBase();
        builder.Property(e => e.EventId).HasMaxLength(100).IsRequired();
        builder.Property(e => e.UserId).HasMaxLength(100);
        builder.Property(e => e.GuestContactId).HasMaxLength(100);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
        builder.Property(e => e.RespondedAt).IsRequired();
        builder.Property(e => e.Note).HasMaxLength(500);
        builder.HasIndex(e => e.EventId);
    }
}
