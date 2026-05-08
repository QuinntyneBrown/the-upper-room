using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheUpperRoom.Domain.Cities;

namespace TheUpperRoom.Infrastructure.Persistence.Configurations;

internal sealed class CityConfiguration : IEntityTypeConfiguration<City>
{
    public void Configure(EntityTypeBuilder<City> builder)
    {
        builder.ToTable("Cities");
        builder.ConfigureAuditable();
        builder.Property(e => e.Name).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Slug).HasMaxLength(120).IsRequired();
        builder.Property(e => e.Country).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Archived).IsRequired();
        builder.HasIndex(e => e.Slug).IsUnique();
    }
}
