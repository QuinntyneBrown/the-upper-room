using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheUpperRoom.Domain.Notifications;

namespace TheUpperRoom.Infrastructure.Persistence.Configurations;

internal sealed class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("Notifications");
        builder.ConfigureEntityBase();
        builder.Property(e => e.UserId).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Code).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Title).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Body).HasMaxLength(1000).IsRequired();
        builder.Property(e => e.Severity).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(e => e.CreatedAt).IsRequired();
        builder.Property(e => e.DeepLink).HasMaxLength(1000);
        builder.Property(e => e.ReadAt);
        builder.Ignore(e => e.IsRead);
        builder.HasIndex(e => new { e.UserId, e.CreatedAt });
    }
}
