using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheUpperRoom.Domain.Ideas;

namespace TheUpperRoom.Infrastructure.Persistence.Configurations;

internal sealed class IdeaConfiguration : IEntityTypeConfiguration<Idea>
{
    public void Configure(EntityTypeBuilder<Idea> builder)
    {
        builder.ToTable("Ideas");
        builder.ConfigureCityScoped();

        builder.Property(e => e.Title).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Summary).HasMaxLength(500).IsRequired();
        builder.Property(e => e.DescriptionMarkdown).HasMaxLength(10000);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
        builder.Property(e => e.ProposerUserId).HasMaxLength(100).IsRequired();
        builder.Property(e => e.CoverImageUrl).HasMaxLength(2048);

        builder.Ignore(e => e.VoteCount);
        builder.Ignore(e => e.PartnerIds);
        builder.Ignore(e => e.TagIds);
        builder.Ignore(e => e.VoteUserIds);

        builder.Property<List<string>>("_partnerIds")
            .HasField("_partnerIds").UsePropertyAccessMode(PropertyAccessMode.Field)
            .HasColumnName("PartnerIds").HasColumnType("nvarchar(max)")
            .HasConversion(JsonConverters.ListConverter<string>(), JsonConverters.ListComparer<string>());

        builder.Property<List<string>>("_tagIds")
            .HasField("_tagIds").UsePropertyAccessMode(PropertyAccessMode.Field)
            .HasColumnName("TagIds").HasColumnType("nvarchar(max)")
            .HasConversion(JsonConverters.ListConverter<string>(), JsonConverters.ListComparer<string>());

        builder.Property<HashSet<string>>("_voteUserIds")
            .HasField("_voteUserIds").UsePropertyAccessMode(PropertyAccessMode.Field)
            .HasColumnName("VoteUserIds").HasColumnType("nvarchar(max)")
            .HasConversion(JsonConverters.StringHashSetConverter(), JsonConverters.StringHashSetComparer());
    }
}
