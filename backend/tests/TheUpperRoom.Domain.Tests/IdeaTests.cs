using TheUpperRoom.Domain.Common;
using TheUpperRoom.Domain.Ideas;

namespace TheUpperRoom.Domain.Tests;

public sealed class IdeaTests
{
    private static readonly DateTimeOffset Utc =
        new(2026, 5, 10, 12, 0, 0, TimeSpan.Zero);

    private static Idea NewIdea() =>
        new(
            "city-1",
            "Outreach event",
            "Summer outreach to local schools",
            "## Plan\nDetails here",
            "user-proposer",
            "creator",
            Utc);

    [Fact]
    public void Status_defaults_to_Draft()
    {
        Assert.Equal(IdeaStatus.Draft, NewIdea().Status);
    }

    [Fact]
    public void Vote_count_starts_at_zero()
    {
        var idea = NewIdea();
        Assert.Equal(0, idea.VoteCount);
        Assert.Empty(idea.VoteUserIds);
    }

    [Fact]
    public void Toggle_vote_adds_then_removes_for_same_user()
    {
        var idea = NewIdea();

        var first = idea.ToggleVote("user-1", "user-1", Utc.AddSeconds(1));
        var second = idea.ToggleVote("user-1", "user-1", Utc.AddSeconds(2));

        Assert.Equal(IdeaVoteChange.Added, first);
        Assert.Equal(IdeaVoteChange.Removed, second);
        Assert.Equal(0, idea.VoteCount);
    }

    [Fact]
    public void Toggle_vote_treats_user_id_case_insensitively()
    {
        var idea = NewIdea();

        idea.ToggleVote("USER-1", "u", Utc.AddSeconds(1));
        var second = idea.ToggleVote("user-1", "u", Utc.AddSeconds(2));

        Assert.Equal(IdeaVoteChange.Removed, second);
        Assert.Equal(0, idea.VoteCount);
    }

    [Fact]
    public void Distinct_users_each_count_once()
    {
        var idea = NewIdea();

        idea.ToggleVote("user-1", "u", Utc.AddSeconds(1));
        idea.ToggleVote("user-2", "u", Utc.AddSeconds(2));
        idea.ToggleVote("user-3", "u", Utc.AddSeconds(3));

        Assert.Equal(3, idea.VoteCount);
    }

    [Fact]
    public void Change_status_records_old_and_new_in_domain_event()
    {
        var idea = NewIdea();

        idea.ChangeStatus(IdeaStatus.Submitted, "editor", Utc.AddHours(1));

        Assert.Equal(IdeaStatus.Submitted, idea.Status);
        var evt = Assert.Single(idea.DomainEvents);
        var status = Assert.IsType<EntityStatusChangedDomainEvent>(evt);
        Assert.Equal("Draft", status.OldStatus);
        Assert.Equal("Submitted", status.NewStatus);
        Assert.Equal(nameof(Idea), status.EntityType);
    }

    [Fact]
    public void Update_dedupes_partner_and_tag_ids_case_insensitively()
    {
        var idea = NewIdea();

        idea.Update(
            "Outreach event",
            "Summer outreach",
            null,
            null,
            partnerIds: ["p-A", "p-a", "p-B"],
            tagIds: ["t-X", "T-x"],
            "editor",
            Utc.AddHours(1));

        Assert.Equal(2, idea.PartnerIds.Count);
        Assert.Single(idea.TagIds);
    }

    [Fact]
    public void Update_rejects_invalid_cover_image_url()
    {
        var idea = NewIdea();

        Assert.Throws<DomainException>(() => idea.Update(
            "t", "s", null, "javascript:alert(1)", [], [], "editor", Utc.AddHours(1)));
    }

    [Fact]
    public void Constructor_rejects_blank_title()
    {
        Assert.Throws<DomainException>(() => new Idea(
            "city-1", "", "summary", null, "user-1", "creator", Utc));
    }

    [Fact]
    public void Constructor_rejects_blank_proposer()
    {
        Assert.Throws<DomainException>(() => new Idea(
            "city-1", "title", "summary", null, "", "creator", Utc));
    }
}
