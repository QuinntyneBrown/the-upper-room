using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheUpperRoom.Domain.Kanban;

namespace TheUpperRoom.Infrastructure.Data.Configurations;

internal sealed class KanbanColumnConfiguration : IEntityTypeConfiguration<KanbanColumn>
{
    public void Configure(EntityTypeBuilder<KanbanColumn> builder)
    {
        builder.ToTable("KanbanColumns");
        builder.ConfigureEntityBase();
        builder.Property(e => e.BoardId).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Name).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Order).IsRequired();
        builder.Property(e => e.Color).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(e => e.WipLimit);
        builder.HasIndex(e => new { e.BoardId, e.Order });
    }
}
