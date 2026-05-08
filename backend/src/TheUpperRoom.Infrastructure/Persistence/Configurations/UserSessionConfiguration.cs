using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheUpperRoom.Domain.Users;

namespace TheUpperRoom.Infrastructure.Persistence.Configurations;

internal sealed class UserSessionConfiguration : IEntityTypeConfiguration<UserSession>
{
    public void Configure(EntityTypeBuilder<UserSession> builder)
    {
        builder.ToTable("UserSessions");
        builder.ConfigureEntityBase();
        builder.Property(e => e.UserId).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Device).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Ip).HasMaxLength(100).IsRequired();
        builder.Property(e => e.UserAgent).HasMaxLength(500).IsRequired();
        builder.Property(e => e.SignedInAt).IsRequired();
        builder.Property(e => e.RevokedAt);
        builder.Property(e => e.RevokedReason).HasMaxLength(200);
        builder.HasIndex(e => e.UserId);
    }
}
