using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheUpperRoom.Domain.Common;

namespace TheUpperRoom.Infrastructure.Persistence.Configurations;

internal static class EntityConfigurationExtensions
{
    public static EntityTypeBuilder<T> ConfigureEntityBase<T>(this EntityTypeBuilder<T> builder)
        where T : Entity
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasMaxLength(100).IsRequired().ValueGeneratedNever();
        return builder;
    }

    public static EntityTypeBuilder<T> ConfigureAuditable<T>(this EntityTypeBuilder<T> builder)
        where T : AuditableEntity
    {
        builder.ConfigureEntityBase();
        builder.Property(e => e.CreatedAt).IsRequired();
        builder.Property(e => e.CreatedBy).HasMaxLength(100).IsRequired();
        builder.Property(e => e.UpdatedAt).IsRequired();
        builder.Property(e => e.UpdatedBy).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Version).IsRowVersion();
        builder.Ignore(e => e.DomainEvents);
        return builder;
    }

    public static EntityTypeBuilder<T> ConfigureCityScoped<T>(this EntityTypeBuilder<T> builder)
        where T : CityScopedAuditableEntity
    {
        builder.ConfigureAuditable();
        builder.Property(e => e.CityId).HasMaxLength(100).IsRequired();
        builder.HasIndex(e => e.CityId);
        return builder;
    }
}
