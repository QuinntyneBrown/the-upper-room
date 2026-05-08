using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheUpperRoom.Domain.Common.ValueObjects;
using TheUpperRoom.Domain.Partners;

namespace TheUpperRoom.Infrastructure.Persistence.Configurations;

internal sealed class PartnerConfiguration : IEntityTypeConfiguration<Partner>
{
    public void Configure(EntityTypeBuilder<Partner> builder)
    {
        builder.ToTable("Partners");
        builder.ConfigureCityScoped();

        builder.Property(e => e.Name).HasMaxLength(200).IsRequired();
        builder.Property(e => e.LegalName).HasMaxLength(200);
        builder.Property(e => e.Website).HasMaxLength(2048);
        builder.Property(e => e.DescriptionMarkdown).HasMaxLength(2000);
        builder.Property(e => e.LogoUrl).HasMaxLength(2048);
        builder.Property(e => e.Archived).IsRequired();
        builder.Property(e => e.DeletedAt);

        builder.HasIndex(e => new { e.CityId, e.Name }).IsUnique();

        builder.Property<List<Address>>("_addresses")
            .HasField("_addresses").UsePropertyAccessMode(PropertyAccessMode.Field)
            .HasColumnName("Addresses").HasColumnType("nvarchar(max)")
            .HasConversion(JsonConverters.ListConverter<Address>(), JsonConverters.ListComparer<Address>());

        builder.Property<List<PhoneNumber>>("_phones")
            .HasField("_phones").UsePropertyAccessMode(PropertyAccessMode.Field)
            .HasColumnName("Phones").HasColumnType("nvarchar(max)")
            .HasConversion(JsonConverters.ListConverter<PhoneNumber>(), JsonConverters.ListComparer<PhoneNumber>());

        builder.Property<List<EmailAddress>>("_emails")
            .HasField("_emails").UsePropertyAccessMode(PropertyAccessMode.Field)
            .HasColumnName("Emails").HasColumnType("nvarchar(max)")
            .HasConversion(JsonConverters.ListConverter<EmailAddress>(), JsonConverters.ListComparer<EmailAddress>());

        builder.Property<List<SocialLink>>("_socialLinks")
            .HasField("_socialLinks").UsePropertyAccessMode(PropertyAccessMode.Field)
            .HasColumnName("SocialLinks").HasColumnType("nvarchar(max)")
            .HasConversion(JsonConverters.ListConverter<SocialLink>(), JsonConverters.ListComparer<SocialLink>());

        builder.Property<List<PartnerContactLink>>("_linkedContacts")
            .HasField("_linkedContacts").UsePropertyAccessMode(PropertyAccessMode.Field)
            .HasColumnName("LinkedContacts").HasColumnType("nvarchar(max)")
            .HasConversion(JsonConverters.ListConverter<PartnerContactLink>(), JsonConverters.ListComparer<PartnerContactLink>());

        builder.Property<List<string>>("_tagIds")
            .HasField("_tagIds").UsePropertyAccessMode(PropertyAccessMode.Field)
            .HasColumnName("TagIds").HasColumnType("nvarchar(max)")
            .HasConversion(JsonConverters.ListConverter<string>(), JsonConverters.ListComparer<string>());
    }
}
