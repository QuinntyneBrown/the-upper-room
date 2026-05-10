using Microsoft.EntityFrameworkCore;
using TheUpperRoom.Application.Auth;
using TheUpperRoom.Infrastructure.Users;

namespace TheUpperRoom.Infrastructure.Auth;

internal sealed class AuthUserStore : IAuthUserStore
{
    private readonly UsersDbContext _db;

    public AuthUserStore(UsersDbContext db)
    {
        _db = db;
    }

    public async Task<AuthUser?> FindByEmailAsync(
        string email,
        CancellationToken cancellationToken = default)
    {
        var normalized = email.Trim().ToLowerInvariant();
        var row = await _db.Users
            .AsNoTracking()
            .Where(user => user.Email == normalized)
            .Select(user => new AuthUser(
                user.Id,
                user.Email,
                user.PasswordHash,
                user.EmailVerified))
            .SingleOrDefaultAsync(cancellationToken)
            .ConfigureAwait(false);

        return row;
    }

    public async Task ReplacePasswordHashAsync(
        string userId,
        string passwordHash,
        DateTimeOffset updatedAt,
        CancellationToken cancellationToken = default)
    {
        var row = await _db.Users.FindAsync([userId], cancellationToken).ConfigureAwait(false);
        if (row is null)
        {
            return;
        }

        row.PasswordHash = passwordHash;
        row.PasswordUpdatedUtc = updatedAt;
        await _db.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
    }

    public async Task RecordSuccessfulSignInAsync(
        string userId,
        DateTimeOffset signedInAt,
        CancellationToken cancellationToken = default)
    {
        var row = await _db.Users.FindAsync([userId], cancellationToken).ConfigureAwait(false);
        if (row is null)
        {
            return;
        }

        row.LastSignInUtc = signedInAt;
        await _db.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
    }
}
