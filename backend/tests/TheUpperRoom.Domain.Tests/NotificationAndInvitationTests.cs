using TheUpperRoom.Domain.Common;
using TheUpperRoom.Domain.Notifications;
using TheUpperRoom.Domain.Users;

namespace TheUpperRoom.Domain.Tests;

public sealed class NotificationAndInvitationTests
{
    private static readonly DateTimeOffset Utc =
        new(2026, 5, 10, 12, 0, 0, TimeSpan.Zero);

    private static Notification NewNotification() =>
        new(
            "user-1",
            "event.invite",
            "You're invited",
            "Sunday Service",
            NotificationSeverity.Info,
            Utc);

    [Fact]
    public void Notification_starts_unread()
    {
        var n = NewNotification();
        Assert.False(n.IsRead);
        Assert.Null(n.ReadAt);
    }

    [Fact]
    public void Mark_read_records_timestamp()
    {
        var n = NewNotification();
        var t1 = Utc.AddHours(1);

        n.MarkRead(t1);

        Assert.True(n.IsRead);
        Assert.Equal(t1, n.ReadAt);
    }

    [Fact]
    public void Mark_read_rejects_non_utc_timestamp()
    {
        var n = NewNotification();
        var notUtc = new DateTimeOffset(2026, 5, 10, 14, 0, 0, TimeSpan.FromHours(2));

        Assert.Throws<DomainException>(() => n.MarkRead(notUtc));
    }

    [Fact]
    public void Notification_constructor_rejects_blank_title_or_body()
    {
        Assert.Throws<DomainException>(() => new Notification(
            "user-1", "code", "", "body", NotificationSeverity.Info, Utc));
        Assert.Throws<DomainException>(() => new Notification(
            "user-1", "code", "title", "", NotificationSeverity.Info, Utc));
    }

    private static Invitation NewInvitation(DateTimeOffset? expires = null) =>
        new(
            "city-1",
            "Invitee@Example.com",
            "Invited",
            "Person",
            "Member",
            personalMessage: null,
            expiresAt: expires ?? Utc.AddDays(7),
            createdBy: "creator",
            createdAt: Utc);

    [Fact]
    public void Invitation_email_is_lowercased_and_must_contain_at()
    {
        var inv = NewInvitation();
        Assert.Equal("invitee@example.com", inv.Email);
        Assert.Throws<DomainException>(() => new Invitation(
            "city-1", "no-at", "F", "L", "Member", null, Utc.AddDays(7), "creator", Utc));
    }

    [Fact]
    public void Invitation_status_defaults_to_pending()
    {
        var inv = NewInvitation();
        Assert.Equal(InvitationStatus.Pending, inv.Status);
    }

    [Fact]
    public void Is_expired_only_when_pending_and_now_is_past_expiry()
    {
        var inv = NewInvitation(expires: Utc.AddDays(1));

        Assert.False(inv.IsExpired(Utc));
        Assert.False(inv.IsExpired(Utc.AddHours(23)));
        Assert.True(inv.IsExpired(Utc.AddDays(1).AddSeconds(1)));
    }

    [Fact]
    public void Accept_after_expiry_throws_and_marks_expired()
    {
        var inv = NewInvitation(expires: Utc.AddDays(1));

        Assert.Throws<DomainException>(() =>
            inv.Accept(Utc.AddDays(2), "invitee-user"));
        Assert.Equal(InvitationStatus.Expired, inv.Status);
    }

    [Fact]
    public void Accept_marks_accepted_and_records_timestamp()
    {
        var inv = NewInvitation();
        var t1 = Utc.AddHours(1);

        inv.Accept(t1, "invitee-user");

        Assert.Equal(InvitationStatus.Accepted, inv.Status);
        Assert.Equal(t1, inv.AcceptedAt);
    }

    [Fact]
    public void Accept_rejects_when_already_revoked()
    {
        var inv = NewInvitation();
        inv.Revoke("admin", Utc.AddHours(1));

        Assert.Throws<DomainException>(() =>
            inv.Accept(Utc.AddHours(2), "invitee-user"));
    }

    [Fact]
    public void Revoke_only_acts_when_status_pending()
    {
        var inv = NewInvitation();
        inv.Accept(Utc.AddHours(1), "invitee-user");
        var beforeUpdated = inv.UpdatedAt;

        inv.Revoke("admin", Utc.AddHours(2));

        // Already accepted -> no change.
        Assert.Equal(InvitationStatus.Accepted, inv.Status);
        Assert.Equal(beforeUpdated, inv.UpdatedAt);
    }
}
