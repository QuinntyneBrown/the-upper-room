// Traces to: TASK-0227
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace TheUpperRoom.Api.Locations;

public sealed class LocationsDbContext(DbContextOptions<LocationsDbContext> options) : DbContext(options)
{
    public DbSet<LocationRow> Locations => Set<LocationRow>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        var jsonStringArray = new ValueConverter<string[], string>(
            v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
            v => JsonSerializer.Deserialize<string[]>(v, (JsonSerializerOptions?)null) ?? Array.Empty<string>());

        var e = b.Entity<LocationRow>();
        e.ToTable("Locations");
        e.HasKey(x => x.Id);
        e.Property(x => x.Id).HasMaxLength(64);
        e.Property(x => x.Name).HasMaxLength(200).IsRequired();
        e.Property(x => x.Street).HasMaxLength(500);
        e.Property(x => x.City).HasMaxLength(200);
        e.Property(x => x.State).HasMaxLength(200);
        e.Property(x => x.Country).HasMaxLength(100);
        e.Property(x => x.PostalCode).HasMaxLength(20);
        e.Property(x => x.Photos).HasConversion(jsonStringArray);
    }
}
