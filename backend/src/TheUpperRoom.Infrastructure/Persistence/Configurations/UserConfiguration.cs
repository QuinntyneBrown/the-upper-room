using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheUpperRoom.Domain.Users;

namespace TheUpperRoom.Infrastructure.Persistence.Configurations;

internal sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");
        builder.ConfigureCityScoped();

        builder.Property(e => e.Email).HasMaxLength(254).IsRequired();
        builder.Property(e => e.FirstName).HasMaxLength(50).IsRequired();
        builder.Property(e => e.LastName).HasMaxLength(50).IsRequired();
        builder.Property(e => e.DisplayNameOverride).HasMaxLength(100);
        builder.Property(e => e.Pronouns).HasMaxLength(30);
        builder.Property(e => e.Title).HasMaxLength(100);
        builder.Property(e => e.TimeZone).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Locale).HasMaxLength(20).IsRequired();
        builder.Property(e => e.AvatarUrl).HasMaxLength(2048);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(e => e.EmailVerifiedAt);
        builder.Property(e => e.LastSignInAt);

        builder.Ignore(e => e.DisplayName);
        builder.Ignore(e => e.Roles);

        builder.HasIndex(e => e.Email).IsUnique();

        builder.Property<List<string>>("_roles")
            .HasField("_roles").UsePropertyAccessMode(PropertyAccessMode.Field)
            .HasColumnName("Roles").HasColumnType("nvarchar(max)")
            .HasConversion(JsonConverters.ListConverter<string>(), JsonConverters.ListComparer<string>());

        builder.HasMany<UserSession>("Sessions")
            .WithOne()
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.Navigation("Sessions")
            .HasField("_sessions")
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
