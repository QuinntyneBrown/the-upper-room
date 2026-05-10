using TheUpperRoom.Domain.Events;
using TheUpperRoom.Domain.Ideas;
using TheUpperRoom.Domain.Kanban;
using TheUpperRoom.Domain.Notes;
using TheUpperRoom.Domain.Notifications;
using TheUpperRoom.Domain.Partners;
using TheUpperRoom.Domain.Tags;
using TheUpperRoom.Domain.Users;

namespace TheUpperRoom.Domain.Tests;

// These tests pin enum surfaces that participate in JSON wire shapes,
// audit logs, or seed data. A rename or removal here would silently
// reshape persisted/serialised values; the assertions surface that.
public sealed class EnumShapeTests
{
    [Fact]
    public void RsvpStatus_has_exactly_these_members()
    {
        Assert.Equal(
            new[] { "Yes", "No", "Maybe", "Waitlist", "PendingApproval" },
            Enum.GetNames<RsvpStatus>());
    }

    [Fact]
    public void EventStatus_has_exactly_these_members()
    {
        Assert.Equal(
            new[] { "Potential", "Scheduled", "InProgress", "Past", "Cancelled" },
            Enum.GetNames<EventStatus>());
    }

    [Fact]
    public void IdeaStatus_has_exactly_these_members_in_lifecycle_order()
    {
        Assert.Equal(
            new[] { "Draft", "Submitted", "UnderReview", "Selected", "InProgress", "Completed", "Archived" },
            Enum.GetNames<IdeaStatus>());
    }

    [Fact]
    public void IdeaVoteChange_has_exactly_added_and_removed()
    {
        Assert.Equal(new[] { "Added", "Removed" }, Enum.GetNames<IdeaVoteChange>());
    }

    [Fact]
    public void NoteSubjectType_covers_the_four_subject_kinds()
    {
        Assert.Equal(
            new[] { "Contact", "Partner", "Idea", "Event" },
            Enum.GetNames<NoteSubjectType>());
    }

    [Fact]
    public void NotificationSeverity_has_the_four_severity_levels()
    {
        Assert.Equal(
            new[] { "Info", "Success", "Warning", "Error" },
            Enum.GetNames<NotificationSeverity>());
    }

    [Fact]
    public void SocialPlatform_includes_other_for_unsupported_entries()
    {
        Assert.Contains("Other", Enum.GetNames<SocialPlatform>());
    }

    [Fact]
    public void InvitationStatus_has_pending_accepted_revoked_expired()
    {
        var names = Enum.GetNames<InvitationStatus>();
        Assert.Contains("Pending", names);
        Assert.Contains("Accepted", names);
        Assert.Contains("Revoked", names);
        Assert.Contains("Expired", names);
    }

    [Fact]
    public void UserStatus_has_pending_active_disabled_deleted()
    {
        var names = Enum.GetNames<UserStatus>();
        Assert.Contains("Pending", names);
        Assert.Contains("Active", names);
        Assert.Contains("Disabled", names);
        Assert.Contains("Deleted", names);
    }

    [Fact]
    public void TagColor_has_at_least_thirteen_palette_members()
    {
        // 13 colours match the palette doc; pinning the floor.
        Assert.True(Enum.GetNames<TagColor>().Length >= 13);
    }

    [Fact]
    public void KanbanFieldType_includes_text_and_select()
    {
        var names = Enum.GetNames<KanbanFieldType>();
        Assert.Contains("Text", names);
        Assert.Contains("Select", names);
    }
}
