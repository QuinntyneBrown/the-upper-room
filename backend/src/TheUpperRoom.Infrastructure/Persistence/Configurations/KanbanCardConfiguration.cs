using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheUpperRoom.Domain.Kanban;

namespace TheUpperRoom.Infrastructure.Persistence.Configurations;

internal sealed class KanbanCardConfiguration : IEntityTypeConfiguration<KanbanCard>
{
    public void Configure(EntityTypeBuilder<KanbanCard> builder)
    {
        builder.ToTable("KanbanCards");
        builder.ConfigureAuditable();
        builder.Property(e => e.BoardId).HasMaxLength(100).IsRequired();
        builder.Property(e => e.ColumnId).HasMaxLength(100).IsRequired();
        builder.Property(e => e.SwimlaneKey).HasMaxLength(100);
        builder.Property(e => e.Position).HasColumnType("decimal(18,6)");
        builder.Property(e => e.AssigneeUserId).HasMaxLength(100);
        builder.Property(e => e.Archived).IsRequired();

        builder.Ignore(e => e.Data);
        builder.Ignore(e => e.TagIds);

        builder.Property<Dictionary<string, string?>>("_data")
            .HasField("_data").UsePropertyAccessMode(PropertyAccessMode.Field)
            .HasColumnName("Data").HasColumnType("nvarchar(max)")
            .HasConversion(JsonConverters.StringDictionaryConverter(), JsonConverters.StringDictionaryComparer());

        builder.Property<List<string>>("_tagIds")
            .HasField("_tagIds").UsePropertyAccessMode(PropertyAccessMode.Field)
            .HasColumnName("TagIds").HasColumnType("nvarchar(max)")
            .HasConversion(JsonConverters.ListConverter<string>(), JsonConverters.ListComparer<string>());

        builder.HasIndex(e => new { e.BoardId, e.ColumnId });
    }
}
