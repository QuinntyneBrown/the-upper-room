using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheUpperRoom.Domain.Kanban;

namespace TheUpperRoom.Infrastructure.Persistence.Configurations;

internal sealed class KanbanSwimlaneConfiguration : IEntityTypeConfiguration<KanbanSwimlane>
{
    public void Configure(EntityTypeBuilder<KanbanSwimlane> builder)
    {
        builder.ToTable("KanbanSwimlanes");
        builder.ConfigureEntityBase();
        builder.Property(e => e.BoardId).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Key).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Name).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Order).IsRequired();
        builder.HasIndex(e => new { e.BoardId, e.Key }).IsUnique();
    }
}
