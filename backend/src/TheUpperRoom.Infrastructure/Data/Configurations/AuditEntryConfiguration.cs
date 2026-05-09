using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheUpperRoom.Domain.Audit;

namespace TheUpperRoom.Infrastructure.Data.Configurations;

internal sealed class AuditEntryConfiguration : IEntityTypeConfiguration<AuditEntry>
{
    public void Configure(EntityTypeBuilder<AuditEntry> builder)
    {
        builder.ToTable("AuditEntries");
        builder.ConfigureEntityBase();
        builder.Property(e => e.Timestamp).IsRequired();
        builder.Property(e => e.ActorUserId).HasMaxLength(100).IsRequired();
        builder.Property(e => e.CityId).HasMaxLength(100);
        builder.Property(e => e.EntityType).HasMaxLength(100).IsRequired();
        builder.Property(e => e.EntityId).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Action).HasMaxLength(100).IsRequired();
        builder.Property(e => e.BeforeJson).HasColumnType("nvarchar(max)");
        builder.Property(e => e.AfterJson).HasColumnType("nvarchar(max)");
        builder.Property(e => e.CorrelationId).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Ip).HasMaxLength(100).IsRequired();
        builder.Property(e => e.UserAgent).HasMaxLength(500).IsRequired();
        builder.HasIndex(e => new { e.EntityType, e.EntityId, e.Timestamp });
        builder.HasIndex(e => new { e.ActorUserId, e.Timestamp });
    }
}
