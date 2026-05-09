using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheUpperRoom.Domain.Tags;

namespace TheUpperRoom.Infrastructure.Data.Configurations;

internal sealed class TagConfiguration : IEntityTypeConfiguration<Tag>
{
    public void Configure(EntityTypeBuilder<Tag> builder)
    {
        builder.ToTable("Tags");
        builder.ConfigureCityScoped();
        builder.Property(e => e.Name).HasMaxLength(50).IsRequired();
        builder.Property(e => e.Slug).HasMaxLength(60).IsRequired();
        builder.Property(e => e.Color).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(e => e.Description).HasMaxLength(200);
        builder.HasIndex(e => new { e.CityId, e.Slug }).IsUnique();
    }
}
