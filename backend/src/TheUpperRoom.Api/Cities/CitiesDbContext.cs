using Microsoft.EntityFrameworkCore;

namespace TheUpperRoom.Api.Cities;

public sealed class CitiesDbContext(DbContextOptions<CitiesDbContext> options) : DbContext(options)
{
    public DbSet<CityRow> Cities => Set<CityRow>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        var e = b.Entity<CityRow>();
        e.ToTable("Cities");
        e.HasKey(x => x.Id);
        e.Property(x => x.Id).HasMaxLength(64);
        e.Property(x => x.Name).HasMaxLength(200).IsRequired();
        e.Property(x => x.Slug).HasMaxLength(200).IsRequired();
        e.Property(x => x.Archived).IsRequired();
    }
}

public sealed class CityRow
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Slug { get; set; } = "";
    public bool Archived { get; set; }
}
