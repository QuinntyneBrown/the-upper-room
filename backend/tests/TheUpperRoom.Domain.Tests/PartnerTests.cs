using TheUpperRoom.Domain.Common;
using TheUpperRoom.Domain.Common.ValueObjects;
using TheUpperRoom.Domain.Partners;

namespace TheUpperRoom.Domain.Tests;

public sealed class PartnerTests
{
    private static readonly DateTimeOffset Utc =
        new(2026, 5, 10, 12, 0, 0, TimeSpan.Zero);

    private static Partner NewPartner() =>
        new("city-1", "Acme Foundation", "creator", Utc);

    [Fact]
    public void Constructor_assigns_name_and_starts_unarchived_undeleted()
    {
        var p = NewPartner();
        Assert.Equal("Acme Foundation", p.Name);
        Assert.False(p.Archived);
        Assert.False(p.IsDeleted);
    }

    [Fact]
    public void Update_basics_rejects_non_http_website_or_logo()
    {
        var p = NewPartner();

        Assert.Throws<DomainException>(() =>
            p.UpdateBasics("Acme", null, "ftp://nope", null, null, "editor", Utc.AddHours(1)));
        Assert.Throws<DomainException>(() =>
            p.UpdateBasics("Acme", null, null, null, "javascript:1", "editor", Utc.AddHours(1)));
    }

    [Fact]
    public void Update_basics_accepts_http_website_and_logo()
    {
        var p = NewPartner();

        p.UpdateBasics(
            "Acme Foundation",
            "Acme Inc.",
            "https://acme.example.com",
            "About",
            "https://cdn.example.com/logo.png",
            "editor", Utc.AddHours(1));

        Assert.Equal("Acme Inc.", p.LegalName);
        Assert.Equal("https://acme.example.com", p.Website);
        Assert.Equal("https://cdn.example.com/logo.png", p.LogoUrl);
    }

    [Fact]
    public void Replace_tags_dedupes_case_insensitively()
    {
        var p = NewPartner();

        p.ReplaceTags(["t-1", "T-1", "t-2"], "editor", Utc.AddHours(1));

        Assert.Equal(2, p.TagIds.Count);
    }

    [Fact]
    public void Link_contact_rejects_duplicate_link()
    {
        var p = NewPartner();
        p.LinkContact("contact-1", "Founder", "editor", Utc.AddHours(1));

        Assert.Throws<DomainException>(() =>
            p.LinkContact("contact-1", "Treasurer", "editor", Utc.AddHours(2)));
    }

    [Fact]
    public void Unlink_contact_when_not_linked_is_noop()
    {
        var p = NewPartner();

        p.UnlinkContact("missing", "editor", Utc.AddHours(1));
        // No exception, no Touch -> UpdatedAt should remain at construction time.
        Assert.Equal(Utc, p.UpdatedAt);
    }

    [Fact]
    public void Soft_delete_redacts_basics_and_clears_collections()
    {
        var p = NewPartner();
        p.LinkContact("contact-1", "Founder", "editor", Utc.AddHours(1));
        p.ReplaceTags(["tag-1"], "editor", Utc.AddHours(1));

        p.SoftDelete("admin", Utc.AddHours(2));

        Assert.True(p.IsDeleted);
        Assert.True(p.Archived);
        Assert.Equal("Deleted Partner", p.Name);
        Assert.Empty(p.LinkedContacts);
        Assert.Empty(p.TagIds);
        Assert.Contains(p.DomainEvents, e => e is EntityDeletedDomainEvent);
    }

    [Fact]
    public void Mutations_after_soft_delete_throw()
    {
        var p = NewPartner();
        p.SoftDelete("admin", Utc.AddHours(1));

        Assert.Throws<DomainException>(() => p.UpdateBasics(
            "Acme", null, null, null, null, "editor", Utc.AddHours(2)));
        Assert.Throws<DomainException>(() => p.LinkContact(
            "contact-1", "Founder", "editor", Utc.AddHours(2)));
        Assert.Throws<DomainException>(() => p.Archive(
            "editor", Utc.AddHours(2)));
    }

    [Fact]
    public void Soft_delete_is_idempotent()
    {
        var p = NewPartner();
        p.SoftDelete("admin", Utc.AddHours(1));
        p.ClearDomainEvents();

        p.SoftDelete("admin", Utc.AddHours(2));

        Assert.Empty(p.DomainEvents);
    }

    [Fact]
    public void Archive_idempotency_emits_event_only_once()
    {
        var p = NewPartner();

        p.Archive("editor", Utc.AddHours(1));
        var firstCount = p.DomainEvents.Count;
        p.Archive("editor", Utc.AddHours(2));

        Assert.Equal(firstCount, p.DomainEvents.Count);
    }
}
