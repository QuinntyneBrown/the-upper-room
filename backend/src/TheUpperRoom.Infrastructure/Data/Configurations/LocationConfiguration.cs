using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheUpperRoom.Domain.Common.ValueObjects;
using TheUpperRoom.Domain.Locations;

namespace TheUpperRoom.Infrastructure.Data.Configurations;

internal sealed class LocationConfiguration : IEntityTypeConfiguration<Location>
{
    public void Configure(EntityTypeBuilder<Location> builder)
    {
        builder.ToTable("Locations");
        builder.ConfigureCityScoped();

        builder.Property(e => e.Name).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Capacity);
        builder.Property(e => e.AccessibilityNotes).HasMaxLength(1000);
        builder.Property(e => e.ParkingNotes).HasMaxLength(500);
        builder.Property(e => e.Archived).IsRequired();

        builder.Ignore(e => e.PhotoUrls);
        builder.Ignore(e => e.TagIds);

        // Address is stored as a JSON document so EF treats it as a scalar
        // (constructor-bindable). The same converter strategy is used for
        // address collections on Contact/Partner, keeping a single mapping
        // strategy across the model.
        builder.Property(e => e.Address)
            .HasColumnName("Address").HasColumnType("nvarchar(max)").IsRequired()
            .HasConversion(JsonConverters.SingleConverter<Address>());

        builder.Property<List<string>>("_photoUrls")
            .HasField("_photoUrls").UsePropertyAccessMode(PropertyAccessMode.Field)
            .HasColumnName("PhotoUrls").HasColumnType("nvarchar(max)")
            .HasConversion(JsonConverters.ListConverter<string>(), JsonConverters.ListComparer<string>());

        builder.Property<List<string>>("_tagIds")
            .HasField("_tagIds").UsePropertyAccessMode(PropertyAccessMode.Field)
            .HasColumnName("TagIds").HasColumnType("nvarchar(max)")
            .HasConversion(JsonConverters.ListConverter<string>(), JsonConverters.ListComparer<string>());
    }
}
