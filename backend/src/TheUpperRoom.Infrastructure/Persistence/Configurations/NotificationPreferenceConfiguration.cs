using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheUpperRoom.Domain.Notifications;

namespace TheUpperRoom.Infrastructure.Persistence.Configurations;

internal sealed class NotificationPreferenceConfiguration : IEntityTypeConfiguration<NotificationPreference>
{
    public void Configure(EntityTypeBuilder<NotificationPreference> builder)
    {
        builder.ToTable("NotificationPreferences");
        builder.ConfigureEntityBase();
        builder.Property(e => e.UserId).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Code).HasMaxLength(100).IsRequired();
        builder.Property(e => e.InApp).IsRequired();
        builder.Property(e => e.Email).IsRequired();
        builder.Property(e => e.Push).IsRequired();
        builder.HasIndex(e => new { e.UserId, e.Code }).IsUnique();
    }
}
