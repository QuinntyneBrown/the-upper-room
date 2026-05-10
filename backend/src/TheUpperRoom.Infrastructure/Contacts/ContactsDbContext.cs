using Microsoft.EntityFrameworkCore;
using TheUpperRoom.Application.Contacts;

namespace TheUpperRoom.Infrastructure.Contacts;

public sealed class ContactsDbContext(DbContextOptions<ContactsDbContext> options)
    : DbContext(options), IContactsDbContext
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
