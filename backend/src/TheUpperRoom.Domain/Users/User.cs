using TheUpperRoom.Domain.Common;

namespace TheUpperRoom.Domain.Users;

public sealed class User : CityScopedAuditableEntity
{
    private readonly List<string> _roles = [];
    private readonly List<UserSession> _sessions = [];

    // EF Core materialization. The public constructor's `role` parameter has no
    // matching mapped property, so EF falls back to this private parameterless
    // constructor and populates fields from the row. Placeholder strings satisfy
    // the base-class guard checks; EF overwrites every persisted field after
    // construction.
    private User() : base("ef-init", "ef-init", DateTimeOffset.UnixEpoch)
    {
        Email = string.Empty;
        FirstName = string.Empty;
        LastName = string.Empty;
    }

    public User(
        string cityId,
        string email,
        string firstName,
        string lastName,
        string role,
        string createdBy,
        DateTimeOffset createdAt,
        string? id = null) : base(cityId, createdBy, createdAt, id)
    {
        Email = NormalizeEmail(email);
        FirstName = Guard.Required(firstName, nameof(FirstName), 50);
        LastName = Guard.Required(lastName, nameof(LastName), 50);
        AssignRole(role, createdBy, createdAt);
    }

    public string Email { get; private set; }

    public string FirstName { get; private set; }

    public string LastName { get; private set; }

    public string? DisplayNameOverride { get; private set; }

    public string DisplayName => DisplayNameOverride ?? $"{FirstName} {LastName}";

    public string? Pronouns { get; private set; }

    public string? Title { get; private set; }

    public string TimeZone { get; private set; } = "UTC";

    public string Locale { get; private set; } = "en-CA";

    public string? AvatarUrl { get; private set; }

    public UserStatus Status { get; private set; } = UserStatus.Pending;

    public string? PasswordHash { get; private set; }

    public DateTimeOffset? PasswordUpdatedUtc { get; private set; }

    public bool EmailVerified { get; private set; }

    public DateTimeOffset? EmailVerifiedAt { get; private set; }

    public string? EmailVerificationTokenHash { get; private set; }

    public string? PasswordResetTokenHash { get; private set; }

    public DateTimeOffset? PasswordResetExpiresUtc { get; private set; }

    public DateTimeOffset? LastSignInAt { get; private set; }

    public IReadOnlyCollection<string> Roles => _roles.AsReadOnly();

    public IReadOnlyCollection<UserSession> Sessions => _sessions.AsReadOnly();

    public void UpdateProfile(
        string firstName,
        string lastName,
        string? displayName,
        string? pronouns,
        string? title,
        string timeZone,
        string locale,
        string updatedBy,
        DateTimeOffset updatedAt)
    {
        FirstName = Guard.Required(firstName, nameof(FirstName), 50);
        LastName = Guard.Required(lastName, nameof(LastName), 50);
        DisplayNameOverride = Guard.Optional(displayName, nameof(DisplayNameOverride), 100);
        Pronouns = Guard.Optional(pronouns, nameof(Pronouns), 30);
        Title = Guard.Optional(title, nameof(Title), 100);
        TimeZone = Guard.Required(timeZone, nameof(TimeZone), 100);
        Locale = Guard.Required(locale, nameof(Locale), 20);
        Touch(updatedBy, updatedAt);
    }

    public void SetAvatar(string? avatarUrl, string updatedBy, DateTimeOffset updatedAt)
    {
        AvatarUrl = Guard.OptionalHttpUrl(avatarUrl, nameof(AvatarUrl));
        Touch(updatedBy, updatedAt);
    }

    public void VerifyEmail(DateTimeOffset verifiedAt, string updatedBy)
    {
        EmailVerifiedAt = Guard.Utc(verifiedAt, nameof(verifiedAt));
        EmailVerified = true;
        EmailVerificationTokenHash = null;
        if (Status == UserStatus.Pending)
        {
            Status = UserStatus.Active;
        }

        Touch(updatedBy, verifiedAt);
    }

    public void SetPasswordHash(string passwordHash, DateTimeOffset updatedAt, string updatedBy)
    {
        PasswordHash = Guard.Required(passwordHash, nameof(passwordHash), 512);
        PasswordUpdatedUtc = Guard.Utc(updatedAt, nameof(updatedAt));
        PasswordResetTokenHash = null;
        PasswordResetExpiresUtc = null;
        Touch(updatedBy, PasswordUpdatedUtc.Value);
    }

    public void SetEmailVerificationToken(string tokenHash, DateTimeOffset updatedAt, string updatedBy)
    {
        EmailVerificationTokenHash = Guard.Required(tokenHash, nameof(tokenHash), 512);
        EmailVerified = false;
        EmailVerifiedAt = null;
        Touch(updatedBy, updatedAt);
    }

    public void SetPasswordResetToken(
        string tokenHash,
        DateTimeOffset expiresUtc,
        DateTimeOffset updatedAt,
        string updatedBy)
    {
        PasswordResetTokenHash = Guard.Required(tokenHash, nameof(tokenHash), 512);
        PasswordResetExpiresUtc = Guard.Utc(expiresUtc, nameof(expiresUtc));
        Touch(updatedBy, updatedAt);
    }

    public void SignIn(DateTimeOffset signedInAt, string sessionId, string device, string ip, string userAgent)
    {
        var utc = Guard.Utc(signedInAt, nameof(signedInAt));
        if (Status != UserStatus.Active)
        {
            throw new DomainException("Only active users can sign in.");
        }

        LastSignInAt = utc;
        _sessions.Add(new UserSession(sessionId, Id, device, ip, userAgent, utc));
        Touch(Id, utc);
    }

    public void Disable(string updatedBy, DateTimeOffset updatedAt)
    {
        Status = UserStatus.Disabled;
        RevokeAllSessions(updatedAt, "User disabled");
        Touch(updatedBy, updatedAt);
    }

    public void Enable(string updatedBy, DateTimeOffset updatedAt)
    {
        Status = UserStatus.Active;
        Touch(updatedBy, updatedAt);
    }

    public void Delete(string updatedBy, DateTimeOffset deletedAt)
    {
        Status = UserStatus.Deleted;
        FirstName = "Deleted";
        LastName = "User";
        DisplayNameOverride = "Deleted User";
        Pronouns = null;
        Title = null;
        AvatarUrl = null;
        RevokeAllSessions(deletedAt, "User deleted");
        Touch(updatedBy, deletedAt);
        Raise(new EntityDeletedDomainEvent(nameof(User), Id, updatedBy, deletedAt));
    }

    public void AssignRole(string role, string updatedBy, DateTimeOffset updatedAt)
    {
        var normalized = Guard.Required(role, nameof(role), 50);
        if (_roles.Contains(normalized))
        {
            return;
        }

        _roles.Add(normalized);
        Touch(updatedBy, updatedAt);
    }

    public void RemoveRole(string role, string updatedBy, DateTimeOffset updatedAt)
    {
        if (_roles.Remove(role))
        {
            Touch(updatedBy, updatedAt);
        }
    }

    public int RevokeOtherSessions(string currentSessionId, DateTimeOffset revokedAt)
    {
        var count = 0;
        foreach (var session in _sessions.Where(session => session.Id != currentSessionId && !session.IsRevoked))
        {
            session.Revoke(revokedAt, "Signed out from another session");
            count++;
        }

        return count;
    }

    private void RevokeAllSessions(DateTimeOffset revokedAt, string reason)
    {
        foreach (var session in _sessions.Where(session => !session.IsRevoked))
        {
            session.Revoke(revokedAt, reason);
        }
    }

    private static string NormalizeEmail(string email)
    {
        var normalized = Guard.Required(email, nameof(Email), 254).ToLowerInvariant();
        if (!normalized.Contains('@', StringComparison.Ordinal))
        {
            throw new DomainException("Enter a valid email address.");
        }

        return normalized;
    }
}
