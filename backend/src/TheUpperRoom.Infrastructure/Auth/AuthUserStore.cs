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
        var normalized = NormalizeEmail(email);
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

    public async Task<AuthUser?> FindByIdAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var row = await _db.Users
            .AsNoTracking()
            .Where(user => user.Id == userId)
            .Select(user => new AuthUser(
                user.Id,
                user.Email,
                user.PasswordHash,
                user.EmailVerified))
            .SingleOrDefaultAsync(cancellationToken)
            .ConfigureAwait(false);
        return row;
    }

    public async Task<string?> CreatePasswordUserAsync(
        string email,
        string passwordHash,
        string city,
        string role,
        string emailVerificationTokenHash,
        DateTimeOffset now,
        CancellationToken cancellationToken = default)
    {
        var normalized = NormalizeEmail(email);
        if (await _db.Users.AnyAsync(user => user.Email == normalized, cancellationToken).ConfigureAwait(false))
        {
            return null;
        }

        var row = new UserRow
        {
            Id = Guid.NewGuid().ToString("N")[..12],
            Email = normalized,
            City = city,
            Role = role,
            PasswordHash = passwordHash,
            PasswordUpdatedUtc = now,
            EmailVerified = false,
            EmailVerificationTokenHash = emailVerificationTokenHash,
        };

        _db.Users.Add(row);
        try
        {
            await _db.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        }
        catch (DbUpdateException)
        {
            return null;
        }

        return row.Id;
    }

    public async Task<bool> SetPasswordResetTokenAsync(
        string email,
        string tokenHash,
        DateTimeOffset expiresUtc,
        DateTimeOffset updatedAt,
        CancellationToken cancellationToken = default)
    {
        var normalized = NormalizeEmail(email);
        var row = await _db.Users
            .SingleOrDefaultAsync(user => user.Email == normalized, cancellationToken)
            .ConfigureAwait(false);
        if (row is null)
        {
            return false;
        }

        row.PasswordResetTokenHash = tokenHash;
        row.PasswordResetExpiresUtc = expiresUtc;
        await _db.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        return true;
    }

    public async Task<bool> ResetPasswordAsync(
        string tokenHash,
        string passwordHash,
        DateTimeOffset updatedAt,
        CancellationToken cancellationToken = default)
    {
        var row = await _db.Users
            .SingleOrDefaultAsync(user => user.PasswordResetTokenHash == tokenHash, cancellationToken)
            .ConfigureAwait(false);
        if (row?.PasswordResetExpiresUtc is null || row.PasswordResetExpiresUtc < updatedAt)
        {
            return false;
        }

        row.PasswordHash = passwordHash;
        row.PasswordUpdatedUtc = updatedAt;
        row.PasswordResetTokenHash = null;
        row.PasswordResetExpiresUtc = null;
        await _db.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        return true;
    }

    public async Task<bool> VerifyEmailAsync(
        string tokenHash,
        DateTimeOffset verifiedAt,
        CancellationToken cancellationToken = default)
    {
        var row = await _db.Users
            .SingleOrDefaultAsync(user => user.EmailVerificationTokenHash == tokenHash, cancellationToken)
            .ConfigureAwait(false);
        if (row is null)
        {
            return false;
        }

        row.EmailVerified = true;
        row.EmailVerificationTokenHash = null;
        await _db.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        return true;
    }

    public async Task<bool> DeleteAccountAsync(
        string userId,
        DateTimeOffset deletedAt,
        CancellationToken cancellationToken = default)
    {
        var row = await _db.Users.FindAsync([userId], cancellationToken).ConfigureAwait(false);
        if (row is null)
        {
            return false;
        }

        _db.Users.Remove(row);
        await _db.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        return true;
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
}
