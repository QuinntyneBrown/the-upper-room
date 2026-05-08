using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheUpperRoom.Domain.Common.ValueObjects;
using TheUpperRoom.Domain.Contacts;

namespace TheUpperRoom.Infrastructure.Persistence.Configurations;

internal sealed class ContactConfiguration : IEntityTypeConfiguration<Contact>
{
    public void Configure(EntityTypeBuilder<Contact> builder)
    {
        builder.ToTable("Contacts");
        builder.ConfigureCityScoped();

        builder.Property(e => e.FirstName).HasMaxLength(100).IsRequired();
        builder.Property(e => e.LastName).HasMaxLength(100).IsRequired();
        builder.Property(e => e.DisplayNameOverride).HasMaxLength(200);
        builder.Property(e => e.Pronouns).HasMaxLength(30);
        builder.Property(e => e.Title).HasMaxLength(100);
        builder.Property(e => e.Organization).HasMaxLength(200);
        builder.Property(e => e.OrganizationPartnerId).HasMaxLength(100);
        builder.Property(e => e.AvatarUrl).HasMaxLength(2048);
        builder.Property(e => e.Archived).IsRequired();
        builder.Property(e => e.DeletedAt);

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

        builder.Property<List<string>>("_tagIds")
            .HasField("_tagIds").UsePropertyAccessMode(PropertyAccessMode.Field)
            .HasColumnName("TagIds").HasColumnType("nvarchar(max)")
            .HasConversion(JsonConverters.ListConverter<string>(), JsonConverters.ListComparer<string>());
    }
}
