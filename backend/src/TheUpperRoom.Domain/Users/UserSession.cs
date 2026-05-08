using TheUpperRoom.Domain.Common;

namespace TheUpperRoom.Domain.Users;

public sealed class UserSession : Entity
{
    public UserSession(
        string? id,
        string userId,
        string device,
        string ip,
        string userAgent,
        DateTimeOffset signedInAt) : base(id)
    {
        UserId = Guard.Id(userId, nameof(UserId));
        Device = Guard.Required(device, nameof(Device), 200);
        Ip = Guard.Required(ip, nameof(Ip), 100);
        UserAgent = Guard.Required(userAgent, nameof(UserAgent), 500);
        SignedInAt = Guard.Utc(signedInAt, nameof(SignedInAt));
    }

    public string UserId { get; }

    public string Device { get; }

    public string Ip { get; }

    public string UserAgent { get; }

    public DateTimeOffset SignedInAt { get; }

    public DateTimeOffset? RevokedAt { get; private set; }

    public string? RevokedReason { get; private set; }

    public bool IsRevoked => RevokedAt is not null;

    public void Revoke(DateTimeOffset revokedAt, string reason)
    {
        RevokedAt = Guard.Utc(revokedAt, nameof(revokedAt));
        RevokedReason = Guard.Optional(reason, nameof(reason), 200);
    }
}
