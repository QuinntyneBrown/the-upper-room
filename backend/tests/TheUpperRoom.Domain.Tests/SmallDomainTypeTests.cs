using TheUpperRoom.Domain.Audit;
using TheUpperRoom.Domain.Common;
using TheUpperRoom.Domain.Kanban;
using TheUpperRoom.Domain.Notifications;
using TheUpperRoom.Domain.Partners;

namespace TheUpperRoom.Domain.Tests;

public sealed class SmallDomainTypeTests
{
    // ---- NotificationPreference -------------------------------------------

    [Fact]
    public void NotificationPreference_constructor_assigns_channels()
    {
        var pref = new NotificationPreference(
            "user-1", "event.invite", inApp: true, email: false, push: true);

        Assert.Equal("user-1", pref.UserId);
        Assert.Equal("event.invite", pref.Code);
        Assert.True(pref.InApp);
        Assert.False(pref.Email);
        Assert.True(pref.Push);
    }

    [Fact]
    public void NotificationPreference_update_replaces_all_three_flags()
    {
        var pref = new NotificationPreference("user-1", "code", true, true, true);

        pref.Update(inApp: false, email: false, push: false);

        Assert.False(pref.InApp);
        Assert.False(pref.Email);
        Assert.False(pref.Push);
    }

    [Fact]
    public void NotificationPreference_constructor_rejects_blank_code()
    {
        Assert.Throws<DomainException>(() =>
            new NotificationPreference("user-1", "", true, true, true));
    }

    // ---- SocialLink --------------------------------------------------------

    [Fact]
    public void SocialLink_requires_http_url()
    {
        Assert.Throws<DomainException>(() =>
            new SocialLink(SocialPlatform.X, "javascript:alert(1)"));
        Assert.Throws<DomainException>(() =>
            new SocialLink(SocialPlatform.X, ""));
    }

    [Fact]
    public void SocialLink_records_have_value_equality()
    {
        var a = new SocialLink(SocialPlatform.Instagram, "https://instagram.com/x");
        var b = new SocialLink(SocialPlatform.Instagram, "https://instagram.com/x");
        var c = new SocialLink(SocialPlatform.X, "https://instagram.com/x");

        Assert.Equal(a, b);
        Assert.NotEqual(a, c);
    }

    // ---- PartnerContactLink ------------------------------------------------

    [Fact]
    public void PartnerContactLink_requires_contact_id_and_role()
    {
        Assert.Throws<DomainException>(() =>
            new PartnerContactLink("", "Founder"));
        Assert.Throws<DomainException>(() =>
            new PartnerContactLink("contact-1", ""));
    }

    [Fact]
    public void PartnerContactLink_records_have_value_equality()
    {
        var a = new PartnerContactLink("contact-1", "Founder");
        var b = new PartnerContactLink("contact-1", "Founder");
        Assert.Equal(a, b);
    }

    // ---- KanbanSwimlane ----------------------------------------------------

    [Fact]
    public void KanbanSwimlane_constructor_rejects_blank_key_and_name()
    {
        Assert.Throws<DomainException>(() =>
            new KanbanSwimlane("board-1", "", "Name", 0));
        Assert.Throws<DomainException>(() =>
            new KanbanSwimlane("board-1", "key", "", 0));
        Assert.Throws<DomainException>(() =>
            new KanbanSwimlane("", "key", "Name", 0));
    }

    [Fact]
    public void KanbanSwimlane_assigns_all_fields()
    {
        var lane = new KanbanSwimlane("board-1", "today", "Today", 2);

        Assert.Equal("board-1", lane.BoardId);
        Assert.Equal("today", lane.Key);
        Assert.Equal("Today", lane.Name);
        Assert.Equal(2, lane.Order);
    }

    // ---- AuditActions constants --------------------------------------------

    [Fact]
    public void AuditActions_constants_match_expected_action_names()
    {
        // These string constants are part of the audit log wire shape; pinning
        // them so an accidental rename surfaces here rather than in production.
        Assert.Equal("Create", AuditActions.Create);
        Assert.Equal("Update", AuditActions.Update);
        Assert.Equal("Delete", AuditActions.Delete);
        Assert.Equal("Archive", AuditActions.Archive);
        Assert.Equal("Restore", AuditActions.Restore);
        Assert.Equal("Login", AuditActions.Login);
        Assert.Equal("Logout", AuditActions.Logout);
        Assert.Equal("PermissionDenied", AuditActions.PermissionDenied);
        Assert.Equal("Move", AuditActions.Move);
    }
}
