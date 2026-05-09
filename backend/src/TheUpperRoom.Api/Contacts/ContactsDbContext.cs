// Traces to: TASK-0223
using Microsoft.EntityFrameworkCore;
using TheUpperRoom.Domain.Cities;

namespace TheUpperRoom.Api.Contacts;

public sealed class ContactsDbContext(DbContextOptions<ContactsDbContext> options) : DbContext(options)
{
    public DbSet<ContactRow> Contacts => Set<ContactRow>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        var e = b.Entity<ContactRow>();
        e.ToTable("Contacts");
        e.HasKey(x => x.Id);
        e.Property(x => x.Id).HasMaxLength(64);
        e.Property(x => x.Name).HasMaxLength(200).IsRequired();
        e.Property(x => x.CityId).HasMaxLength(100).IsRequired();
    }
}

public sealed class ContactRow : IHasCity
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string CityId { get; set; } = "";

    public Contact ToContact() => new(Id, Name, CityId);
}
