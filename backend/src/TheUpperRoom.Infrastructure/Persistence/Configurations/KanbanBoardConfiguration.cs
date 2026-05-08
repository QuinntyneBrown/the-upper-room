using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheUpperRoom.Domain.Kanban;

namespace TheUpperRoom.Infrastructure.Persistence.Configurations;

internal sealed class KanbanBoardConfiguration : IEntityTypeConfiguration<KanbanBoard>
{
    public void Configure(EntityTypeBuilder<KanbanBoard> builder)
    {
        builder.ToTable("KanbanBoards");
        builder.ConfigureCityScoped();

        builder.Property(e => e.Name).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Description).HasMaxLength(500);
        builder.Property(e => e.WipLimitPerColumn);

        builder.Property<List<CardSchemaField>>("_cardSchema")
            .HasField("_cardSchema").UsePropertyAccessMode(PropertyAccessMode.Field)
            .HasColumnName("CardSchema").HasColumnType("nvarchar(max)")
            .HasConversion(JsonConverters.ListConverter<CardSchemaField>(), JsonConverters.ListComparer<CardSchemaField>());

        builder.HasMany<KanbanColumn>("Columns")
            .WithOne()
            .HasForeignKey(c => c.BoardId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.Navigation("Columns")
            .HasField("_columns")
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasMany<KanbanSwimlane>("Swimlanes")
            .WithOne()
            .HasForeignKey(s => s.BoardId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.Navigation("Swimlanes")
            .HasField("_swimlanes")
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasMany<KanbanCard>("Cards")
            .WithOne()
            .HasForeignKey(c => c.BoardId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.Navigation("Cards")
            .HasField("_cards")
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
