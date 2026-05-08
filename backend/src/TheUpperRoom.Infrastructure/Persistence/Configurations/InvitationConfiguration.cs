using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheUpperRoom.Domain.Users;

namespace TheUpperRoom.Infrastructure.Persistence.Configurations;

internal sealed class InvitationConfiguration : IEntityTypeConfiguration<Invitation>
{
    public void Configure(EntityTypeBuilder<Invitation> builder)
    {
        builder.ToTable("Invitations");
        builder.ConfigureCityScoped();
        builder.Property(e => e.Email).HasMaxLength(254).IsRequired();
        builder.Property(e => e.FirstName).HasMaxLength(50).IsRequired();
        builder.Property(e => e.LastName).HasMaxLength(50).IsRequired();
        builder.Property(e => e.Role).HasMaxLength(50).IsRequired();
        builder.Property(e => e.PersonalMessage).HasMaxLength(500);
        builder.Property(e => e.ExpiresAt).IsRequired();
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(e => e.AcceptedAt);
        builder.Property(e => e.RevokedAt);
        builder.HasIndex(e => new { e.CityId, e.Email });
    }
}
