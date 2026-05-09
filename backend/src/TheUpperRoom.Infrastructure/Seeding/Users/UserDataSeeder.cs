using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TheUpperRoom.Infrastructure.Users;

namespace TheUpperRoom.Infrastructure.Seeding.Users;

/// <summary>
/// Seeds the four standard development users (admin, lead, member, guest) in
/// the Toronto city. Idempotent: existing rows are left in place.
/// </summary>
internal sealed class UserDataSeeder : IDataSeeder
{
    private readonly UsersDbContext _db;
    private readonly ILogger<UserDataSeeder> _logger;

    public UserDataSeeder(UsersDbContext db, ILogger<UserDataSeeder> logger)
    {
        _db = db;
        _logger = logger;
    }

    public int Order => 0;

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        await _db.Database.EnsureCreatedAsync(cancellationToken).ConfigureAwait(false);

        var seeds = new[]
        {
            new UserRow { Id = "admin",  Email = "admin@test.local",  City = "Toronto", Role = "SystemAdmin" },
            new UserRow { Id = "lead",   Email = "lead@test.local",   City = "Toronto", Role = "CityLead" },
            new UserRow { Id = "member", Email = "member@test.local", City = "Toronto", Role = "Member" },
            new UserRow { Id = "guest",  Email = "guest@test.local",  City = "Toronto", Role = "Guest" },
        };

        var existingIds = await _db.Users
            .Where(u => seeds.Select(s => s.Id).Contains(u.Id))
            .Select(u => u.Id)
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);

        var toAdd = seeds.Where(s => !existingIds.Contains(s.Id)).ToArray();
        if (toAdd.Length == 0)
        {
            _logger.LogInformation("UserDataSeeder: all dev users already present.");
            return;
        }

        _db.Users.AddRange(toAdd);
        try
        {
            await _db.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
            _logger.LogInformation("UserDataSeeder: inserted {Count} dev user(s).", toAdd.Length);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogWarning(ex, "UserDataSeeder: insert collision (parallel host); ignoring.");
        }
    }
}
