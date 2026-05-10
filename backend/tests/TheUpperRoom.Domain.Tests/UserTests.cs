using TheUpperRoom.Domain.Common;
using TheUpperRoom.Domain.Users;

namespace TheUpperRoom.Domain.Tests;

public sealed class UserTests
{
    private static readonly DateTimeOffset Utc =
        new(2026, 5, 10, 12, 0, 0, TimeSpan.Zero);

    private static User NewUser() =>
        new("city-1", "Ada@Example.com", "Ada", "Lovelace", "Member", "creator", Utc);

    [Fact]
    public void Email_is_lowercased_and_trimmed_at_construction()
    {
        var user = NewUser();
        Assert.Equal("ada@example.com", user.Email);
    }

    [Fact]
    public void Email_without_at_sign_is_rejected()
    {
        Assert.Throws<DomainException>(() => new User(
            "city-1", "no-at-sign", "Ada", "Lovelace", "Member", "creator", Utc));
    }

    [Fact]
    public void Status_defaults_to_Pending_and_role_is_assigned_at_construction()
    {
        var user = NewUser();
        Assert.Equal(UserStatus.Pending, user.Status);
        Assert.Contains("Member", user.Roles);
    }

    [Fact]
    public void Verify_email_promotes_pending_to_active_and_clears_token()
    {
        var user = NewUser();
        user.SetEmailVerificationToken("hashedtoken", Utc.AddMinutes(1), "creator");

        user.VerifyEmail(Utc.AddMinutes(2), "creator");

        Assert.Equal(UserStatus.Active, user.Status);
        Assert.True(user.EmailVerified);
        Assert.Null(user.EmailVerificationTokenHash);
    }

    [Fact]
    public void Sign_in_blocks_when_user_not_active()
    {
        var user = NewUser(); // Pending

        Assert.Throws<DomainException>(() =>
            user.SignIn(Utc.AddHours(1), "session-1", "device", "1.2.3.4", "ua/1"));
    }

    [Fact]
    public void Sign_in_records_session_and_last_sign_in()
    {
        var user = NewUser();
        user.VerifyEmail(Utc.AddMinutes(1), "creator");

        user.SignIn(Utc.AddHours(1), "session-1", "iPhone", "1.2.3.4", "ua/1");

        Assert.Equal(Utc.AddHours(1), user.LastSignInAt);
        Assert.Single(user.Sessions);
        Assert.Equal("session-1", user.Sessions.Single().Id);
    }

    [Fact]
    public void Set_password_hash_clears_reset_token()
    {
        var user = NewUser();
        user.SetPasswordResetToken("reset-hash", Utc.AddHours(1), Utc, "creator");

        user.SetPasswordHash("new-hash", Utc.AddHours(2), "creator");

        Assert.Null(user.PasswordResetTokenHash);
        Assert.Null(user.PasswordResetExpiresUtc);
        Assert.Equal("new-hash", user.PasswordHash);
        Assert.Equal(Utc.AddHours(2), user.PasswordUpdatedUtc);
    }

    [Fact]
    public void Disable_revokes_all_active_sessions_and_sets_status()
    {
        var user = NewUser();
        user.VerifyEmail(Utc.AddMinutes(1), "creator");
        user.SignIn(Utc.AddHours(1), "s1", "d", "ip", "ua");
        user.SignIn(Utc.AddHours(2), "s2", "d", "ip", "ua");

        user.Disable("admin", Utc.AddHours(3));

        Assert.Equal(UserStatus.Disabled, user.Status);
        Assert.All(user.Sessions, s => Assert.True(s.IsRevoked));
    }

    [Fact]
    public void Delete_redacts_pii_and_emits_deleted_event()
    {
        var user = NewUser();

        user.Delete("admin", Utc.AddHours(1));

        Assert.Equal(UserStatus.Deleted, user.Status);
        Assert.Equal("Deleted", user.FirstName);
        Assert.Equal("User", user.LastName);
        Assert.Equal("Deleted User", user.DisplayName);
        Assert.Null(user.AvatarUrl);
        Assert.Contains(user.DomainEvents, e => e is EntityDeletedDomainEvent);
    }

    [Fact]
    public void Assign_role_is_idempotent()
    {
        var user = NewUser();

        user.AssignRole("Member", "admin", Utc.AddHours(1));
        user.AssignRole("Admin", "admin", Utc.AddHours(2));

        Assert.Equal(["Member", "Admin"], user.Roles);
    }

    [Fact]
    public void Revoke_other_sessions_keeps_current_only()
    {
        var user = NewUser();
        user.VerifyEmail(Utc.AddMinutes(1), "creator");
        user.SignIn(Utc.AddHours(1), "s1", "d", "ip", "ua");
        user.SignIn(Utc.AddHours(2), "s2", "d", "ip", "ua");
        user.SignIn(Utc.AddHours(3), "s3", "d", "ip", "ua");

        var count = user.RevokeOtherSessions("s2", Utc.AddHours(4));

        Assert.Equal(2, count);
        var s2 = user.Sessions.Single(s => s.Id == "s2");
        Assert.False(s2.IsRevoked);
        Assert.True(user.Sessions.Single(s => s.Id == "s1").IsRevoked);
        Assert.True(user.Sessions.Single(s => s.Id == "s3").IsRevoked);
    }
}
