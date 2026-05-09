using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheUpperRoom.Domain.Events;

namespace TheUpperRoom.Infrastructure.Data.Configurations;

internal sealed class EventConfiguration : IEntityTypeConfiguration<Event>
{
    public void Configure(EntityTypeBuilder<Event> builder)
    {
        builder.ToTable("Events");
        builder.ConfigureCityScoped();

        builder.Property(e => e.Title).HasMaxLength(200).IsRequired();
        builder.Property(e => e.DescriptionMarkdown).HasMaxLength(10000);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
        builder.Property(e => e.StartsAt).IsRequired();
        builder.Property(e => e.EndsAt).IsRequired();
        builder.Property(e => e.Timezone).HasMaxLength(100).IsRequired();
        builder.Property(e => e.LocationId).HasMaxLength(100);
        builder.Property(e => e.VirtualMeetingUrl).HasMaxLength(2048);
        builder.Property(e => e.Capacity);
        builder.Property(e => e.RequiresApproval).IsRequired();
        builder.Property(e => e.CoverImageUrl).HasMaxLength(2048);

        builder.HasIndex(e => new { e.CityId, e.StartsAt });

        builder.Property<List<string>>("_tagIds")
            .HasField("_tagIds").UsePropertyAccessMode(PropertyAccessMode.Field)
            .HasColumnName("TagIds").HasColumnType("nvarchar(max)")
            .HasConversion(JsonConverters.ListConverter<string>(), JsonConverters.ListComparer<string>());

        builder.Property<List<string>>("_partnerIds")
            .HasField("_partnerIds").UsePropertyAccessMode(PropertyAccessMode.Field)
            .HasColumnName("PartnerIds").HasColumnType("nvarchar(max)")
            .HasConversion(JsonConverters.ListConverter<string>(), JsonConverters.ListComparer<string>());

        builder.HasMany<EventAttendee>("Attendees")
            .WithOne()
            .HasForeignKey(a => a.EventId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.Navigation("Attendees")
            .HasField("_attendees")
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
