using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TheUpperRoom.Application.Auth;
using TheUpperRoom.Infrastructure.Users;

namespace TheUpperRoom.Infrastructure.Seeding.Users;

/// <summary>
/// Seeds the four standard development users (admin, lead, member, guest) in
/// the Toronto city. Idempotent: existing rows are left in place.
/// </summary>
internal sealed class UserDataSeeder : IDataSeeder
{
    private readonly UsersDbContext _db;
    private readonly IPasswordHasher _passwords;
    private readonly ILogger<UserDataSeeder> _logger;

    public UserDataSeeder(
        UsersDbContext db,
        IPasswordHasher passwords,
        ILogger<UserDataSeeder> logger)
    {
        _db = db;
        _passwords = passwords;
        _logger = logger;
    }

    public int Order => 0;

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        await _db.Database.EnsureCreatedAsync(cancellationToken).ConfigureAwait(false);
        await EnsureAuthColumnsAsync(cancellationToken).ConfigureAwait(false);
        var now = DateTimeOffset.UtcNow;
        var passwordHash = _passwords.Hash("UpperRoomDev!42");

        var seeds = new[]
        {
            new UserRow { Id = "admin",  Email = "admin@test.local",  City = "Toronto", Role = "SystemAdmin", PasswordHash = passwordHash, PasswordUpdatedUtc = now, EmailVerified = true },
            new UserRow { Id = "lead",   Email = "lead@test.local",   City = "Toronto", Role = "CityLead", PasswordHash = passwordHash, PasswordUpdatedUtc = now, EmailVerified = true },
            new UserRow { Id = "member", Email = "member@test.local", City = "Toronto", Role = "Member", PasswordHash = passwordHash, PasswordUpdatedUtc = now, EmailVerified = true },
            new UserRow { Id = "guest",  Email = "guest@test.local",  City = "Toronto", Role = "Guest", PasswordHash = passwordHash, PasswordUpdatedUtc = now, EmailVerified = true },
        };

        var existing = await _db.Users
            .Where(u => seeds.Select(s => s.Id).Contains(u.Id))
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);
        foreach (var existingUser in existing.Where(user => user.PasswordHash is null))
        {
            existingUser.PasswordHash = passwordHash;
            existingUser.PasswordUpdatedUtc = now;
            existingUser.EmailVerified = true;
        }

        var existingIds = existing.Select(user => user.Id).ToArray();
        var toAdd = seeds.Where(s => !existingIds.Contains(s.Id)).ToArray();
        if (toAdd.Length == 0 && !existing.Any(user => _db.Entry(user).State == EntityState.Modified))
        {
            _logger.LogInformation("UserDataSeeder: all dev users already present.");
            return;
        }

        _db.Users.AddRange(toAdd);
        try
        {
            await _db.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
            _logger.LogInformation(
                "UserDataSeeder: inserted {Count} dev user(s).",
                toAdd.Length);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogWarning(ex, "UserDataSeeder: insert collision (parallel host); ignoring.");
        }
    }

    private async Task EnsureAuthColumnsAsync(CancellationToken cancellationToken)
    {
        var connection = _db.Database.GetDbConnection();
        var shouldClose = connection.State == System.Data.ConnectionState.Closed;
        if (shouldClose)
        {
            await connection.OpenAsync(cancellationToken).ConfigureAwait(false);
        }

        try
        {
            var columns = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            await using (var command = connection.CreateCommand())
            {
                command.CommandText = "PRAGMA table_info('Users');";
                await using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
                while (await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
                {
                    columns.Add(reader.GetString(1));
                }
            }

            foreach (var (name, definition) in RequiredColumns)
            {
                if (columns.Contains(name))
                {
                    continue;
                }

                await using var command = connection.CreateCommand();
                command.CommandText = $"ALTER TABLE Users ADD COLUMN {definition};";
                await command.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
            }
        }
        finally
        {
            if (shouldClose)
            {
                await connection.CloseAsync().ConfigureAwait(false);
            }
        }
    }

    private static readonly (string Name, string Definition)[] RequiredColumns =
    [
        ("PasswordHash", "PasswordHash TEXT NULL"),
        ("PasswordUpdatedUtc", "PasswordUpdatedUtc TEXT NULL"),
        ("EmailVerified", "EmailVerified INTEGER NOT NULL DEFAULT 0"),
        ("EmailVerificationTokenHash", "EmailVerificationTokenHash TEXT NULL"),
        ("PasswordResetTokenHash", "PasswordResetTokenHash TEXT NULL"),
        ("PasswordResetExpiresUtc", "PasswordResetExpiresUtc TEXT NULL"),
        ("LastSignInUtc", "LastSignInUtc TEXT NULL"),
    ];
}
