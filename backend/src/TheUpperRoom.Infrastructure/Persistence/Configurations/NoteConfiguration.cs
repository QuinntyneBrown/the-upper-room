using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheUpperRoom.Domain.Notes;

namespace TheUpperRoom.Infrastructure.Persistence.Configurations;

internal sealed class NoteConfiguration : IEntityTypeConfiguration<Note>
{
    public void Configure(EntityTypeBuilder<Note> builder)
    {
        builder.ToTable("Notes");
        builder.ConfigureAuditable();

        builder.Property(e => e.SubjectType).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(e => e.SubjectId).HasMaxLength(100).IsRequired();
        builder.Property(e => e.BodyMarkdown).HasMaxLength(10000).IsRequired();
        builder.Property(e => e.BodyHtmlSanitized).HasMaxLength(20000).IsRequired();

        builder.HasIndex(e => new { e.SubjectType, e.SubjectId });

        builder.Property<List<NoteVersion>>("_history")
            .HasField("_history").UsePropertyAccessMode(PropertyAccessMode.Field)
            .HasColumnName("History").HasColumnType("nvarchar(max)")
            .HasConversion(JsonConverters.ListConverter<NoteVersion>(), JsonConverters.ListComparer<NoteVersion>());
    }
}
