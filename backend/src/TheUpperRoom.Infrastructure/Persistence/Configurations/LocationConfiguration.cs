using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheUpperRoom.Domain.Locations;

namespace TheUpperRoom.Infrastructure.Persistence.Configurations;

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

        builder.OwnsOne(e => e.Address, address =>
        {
            address.Property(a => a.Street1).HasColumnName("AddressStreet1").HasMaxLength(200).IsRequired();
            address.Property(a => a.Street2).HasColumnName("AddressStreet2").HasMaxLength(200);
            address.Property(a => a.City).HasColumnName("AddressCity").HasMaxLength(100).IsRequired();
            address.Property(a => a.Region).HasColumnName("AddressRegion").HasMaxLength(100);
            address.Property(a => a.PostalCode).HasColumnName("AddressPostalCode").HasMaxLength(30);
            address.Property(a => a.Country).HasColumnName("AddressCountry").HasMaxLength(100).IsRequired();
            address.Property(a => a.Latitude).HasColumnName("AddressLatitude").HasColumnType("decimal(9,6)");
            address.Property(a => a.Longitude).HasColumnName("AddressLongitude").HasColumnType("decimal(9,6)");
        });

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
