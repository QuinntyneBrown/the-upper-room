// traces_to: L2-019, L2-023, L2-029, L2-041, L2-043, L2-048, L2-052, L2-057, L2-074
using TheUpperRoom.Domain.Auth;
using TheUpperRoom.Domain.Common;
using TheUpperRoom.Domain.Common.ValueObjects;
using TheUpperRoom.Domain.Contacts;
using DomainEvent = TheUpperRoom.Domain.Events.Event;
using TheUpperRoom.Domain.Events;
using TheUpperRoom.Domain.Ideas;
using TheUpperRoom.Domain.Kanban;
using TheUpperRoom.Domain.Locations;
using TheUpperRoom.Domain.Notes;
using TheUpperRoom.Domain.Rbac;
using TheUpperRoom.Domain.Tags;

namespace TheUpperRoom.Domain.Tests;

public sealed class DomainModelTests
{
    private static readonly DateTimeOffset Now = new(2026, 5, 8, 18, 0, 0, TimeSpan.Zero);

    [Fact]
    public void Domain_project_has_no_external_dependencies()
    {
        var references = typeof(Contact).Assembly.GetReferencedAssemblies();

        Assert.All(references, reference => Assert.StartsWith("System", reference.Name));
    }

    [Fact]
    public void Canonical_roles_expose_required_permissions()
    {
        var admin = RoleCatalog.PermissionsFor(RoleNames.SystemAdmin).Select(permission => permission.ToString());
        var member = RoleCatalog.PermissionsFor(RoleNames.Member).Select(permission => permission.ToString());
        var guest = RoleCatalog.PermissionsFor(RoleNames.Guest).Select(permission => permission.ToString());

        Assert.Contains("User:Manage", admin);
        Assert.Contains("Audit:Read", admin);
        Assert.Contains("Contact:Read", member);
        Assert.DoesNotContain("Contact:Create", member);
        Assert.Equal(["Event:Read", "Event:RSVP"], guest);
    }

    [Fact]
    public void Password_policy_rejects_common_and_identifier_based_passwords()
    {
        var policy = new PasswordPolicy();

        var common = policy.Evaluate("Password1!", "alice@example.com", "Alice Smith");
        var personal = policy.Evaluate("AliceHasOneStrong1!", "alice@example.com", "Alice Smith");
        var strong = policy.Evaluate("CorrectHorse1!", "alice@example.com", "Alice Smith");

        Assert.False(common.IsValid);
        Assert.False(personal.IsValid);
        Assert.True(strong.IsValid);
    }

    [Fact]
    public void Contact_soft_delete_redacts_personal_data()
    {
        var contact = new Contact("toronto", "Alice", "Smith", "admin", Now);
        contact.ReplaceEmails([new EmailAddress("Work", "alice@example.com", true)], "admin", Now);
        contact.ReplacePhones([new PhoneNumber("Mobile", "+15551234567", true)], "admin", Now);

        contact.SoftDelete("admin", Now.AddMinutes(1));

        Assert.True(contact.IsDeleted);
        Assert.Equal("Deleted Contact", contact.DisplayName);
        Assert.Empty(contact.Emails);
        Assert.Empty(contact.Phones);
        Assert.Contains(contact.DomainEvents, domainEvent => domainEvent is EntityDeletedDomainEvent);
    }

    [Fact]
    public void Note_keeps_only_last_20_prior_versions()
    {
        var note = new Note(NoteSubjectType.Contact, "contact-1", "v0", "<p>v0</p>", "author", Now);

        for (var index = 1; index <= 25; index++)
        {
            note.UpdateBody($"v{index}", $"<p>v{index}</p>", "author", Now.AddMinutes(index));
        }

        Assert.Equal(20, note.History.Count);
        Assert.Equal("v24", note.History.First().BodyMarkdown);
        Assert.Equal("v5", note.History.Last().BodyMarkdown);
    }

    [Fact]
    public void Kanban_column_rejects_cards_over_wip_limit()
    {
        var board = new KanbanBoard("toronto", "Hackathon", null, "lead", Now);
        var column = board.AddColumn("In Progress", TagColor.Blue, 1, "lead", Now);
        board.ReplaceSchema([new CardSchemaField("title", KanbanFieldType.Text, "Title", true)], "lead", Now);
        board.AddCard(column.Id, null, 1, new Dictionary<string, string?> { ["title"] = "Build API" }, null, [], "lead", Now);

        var ex = Assert.Throws<DomainException>(() =>
            board.AddCard(column.Id, null, 2, new Dictionary<string, string?> { ["title"] = "Build UI" }, null, [], "lead", Now));

        Assert.Contains("WIP limit reached", ex.Message);
    }

    [Fact]
    public void Idea_vote_is_a_user_toggle()
    {
        var idea = new Idea("toronto", "Mentorship app", "Match mentors", null, "member", "member", Now);

        var added = idea.ToggleVote("voter", "voter", Now);
        var removed = idea.ToggleVote("voter", "voter", Now);

        Assert.Equal(IdeaVoteChange.Added, added);
        Assert.Equal(IdeaVoteChange.Removed, removed);
        Assert.Equal(0, idea.VoteCount);
    }

    [Fact]
    public void Event_rsvp_goes_to_waitlist_when_capacity_is_full()
    {
        var meetup = new DomainEvent(
            "toronto",
            "Build night",
            null,
            Now.AddDays(1),
            Now.AddDays(1).AddHours(2),
            "America/Toronto",
            "lead",
            Now);
        meetup.Update(
            meetup.Title,
            null,
            meetup.StartsAt,
            meetup.EndsAt,
            meetup.Timezone,
            null,
            null,
            1,
            false,
            null,
            [],
            [],
            "lead",
            Now);

        var first = meetup.Rsvp("user-1", null, RsvpStatus.Yes, Now.AddMinutes(1));
        var second = meetup.Rsvp("user-2", null, RsvpStatus.Yes, Now.AddMinutes(2));

        Assert.Equal(RsvpStatus.Yes, first);
        Assert.Equal(RsvpStatus.Waitlist, second);
    }

    [Fact]
    public void Location_delete_guard_blocks_locations_used_by_events()
    {
        var location = new Location(
            "toronto",
            "Community Hall",
            new Address("1 Main St", null, "Toronto", "ON", "M1M 1M1", "Canada"),
            "lead",
            Now);

        var ex = Assert.Throws<DomainException>(() => location.EnsureCanDelete(2));

        Assert.Contains("Archive it instead", ex.Message);
    }
}
