using Microsoft.EntityFrameworkCore;

namespace TheUpperRoom.Infrastructure.Users;

public sealed class UsersDbContext(DbContextOptions<UsersDbContext> options) : DbContext(options)
{
    public DbSet<UserRow> Users => Set<UserRow>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        var e = b.Entity<UserRow>();
        e.ToTable("Users");
        e.HasKey(x => x.Id);
        e.Property(x => x.Id).HasMaxLength(64);
        e.Property(x => x.Email).HasMaxLength(254).IsRequired();
        e.Property(x => x.City).HasMaxLength(100).IsRequired();
        e.Property(x => x.Role).HasMaxLength(50).IsRequired();
        e.HasIndex(x => x.Email).IsUnique();
    }
}

public sealed class UserRow
{
    public string Id { get; set; } = "";
    public string Email { get; set; } = "";
    public string City { get; set; } = "";
    public string Role { get; set; } = "";
}
