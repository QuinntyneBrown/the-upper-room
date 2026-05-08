using TheUpperRoom.Domain.Common;

namespace TheUpperRoom.Domain.Users;

public sealed class Invitation : CityScopedAuditableEntity
{
    public Invitation(
        string cityId,
        string email,
        string firstName,
        string lastName,
        string role,
        string? personalMessage,
        DateTimeOffset expiresAt,
        string createdBy,
        DateTimeOffset createdAt,
        string? id = null) : base(cityId, createdBy, createdAt, id)
    {
        Email = NormalizeEmail(email);
        FirstName = Guard.Required(firstName, nameof(FirstName), 50);
        LastName = Guard.Required(lastName, nameof(LastName), 50);
        Role = Guard.Required(role, nameof(Role), 50);
        PersonalMessage = Guard.Optional(personalMessage, nameof(PersonalMessage), 500);
        ExpiresAt = Guard.Utc(expiresAt, nameof(ExpiresAt));
    }

    public string Email { get; private set; }

    public string FirstName { get; private set; }

    public string LastName { get; private set; }

    public string Role { get; private set; }

    public string? PersonalMessage { get; private set; }

    public DateTimeOffset ExpiresAt { get; private set; }

    public InvitationStatus Status { get; private set; } = InvitationStatus.Pending;

    public DateTimeOffset? AcceptedAt { get; private set; }

    public DateTimeOffset? RevokedAt { get; private set; }

    public bool IsExpired(DateTimeOffset now) => Status == InvitationStatus.Pending && Guard.Utc(now, nameof(now)) > ExpiresAt;

    public void Accept(DateTimeOffset acceptedAt, string acceptedBy)
    {
        if (IsExpired(acceptedAt))
        {
            Status = InvitationStatus.Expired;
            throw new DomainException("Invitation has expired.");
        }

        if (Status != InvitationStatus.Pending)
        {
            throw new DomainException("Only pending invitations can be accepted.");
        }

        AcceptedAt = Guard.Utc(acceptedAt, nameof(acceptedAt));
        Status = InvitationStatus.Accepted;
        Touch(acceptedBy, acceptedAt);
    }

    public void Revoke(string updatedBy, DateTimeOffset revokedAt)
    {
        if (Status != InvitationStatus.Pending)
        {
            return;
        }

        RevokedAt = Guard.Utc(revokedAt, nameof(revokedAt));
        Status = InvitationStatus.Revoked;
        Touch(updatedBy, revokedAt);
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
