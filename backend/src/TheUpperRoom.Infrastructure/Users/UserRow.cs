namespace TheUpperRoom.Infrastructure.Users;

public sealed class UserRow
{
    public string Id { get; set; } = "";
    public string Email { get; set; } = "";
    public string City { get; set; } = "";
    public string Role { get; set; } = "";
    public string? PasswordHash { get; set; }
    public DateTimeOffset? PasswordUpdatedUtc { get; set; }
    public bool EmailVerified { get; set; }
    public string? EmailVerificationTokenHash { get; set; }
    public string? PasswordResetTokenHash { get; set; }
    public DateTimeOffset? PasswordResetExpiresUtc { get; set; }
    public DateTimeOffset? LastSignInUtc { get; set; }
}
