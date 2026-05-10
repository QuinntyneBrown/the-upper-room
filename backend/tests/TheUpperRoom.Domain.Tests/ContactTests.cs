using TheUpperRoom.Domain.Common;
using TheUpperRoom.Domain.Common.ValueObjects;
using TheUpperRoom.Domain.Contacts;

namespace TheUpperRoom.Domain.Tests;

public sealed class ContactTests
{
    private static readonly DateTimeOffset Utc =
        new(2026, 5, 10, 12, 0, 0, TimeSpan.Zero);

    private static Contact NewContact() =>
        new("city-1", "Ada", "Lovelace", "creator", Utc);

    [Fact]
    public void Display_name_falls_back_to_first_plus_last_when_no_override()
    {
        var contact = NewContact();
        Assert.Equal("Ada Lovelace", contact.DisplayName);
    }

    [Fact]
    public void Display_name_uses_override_when_set()
    {
        var contact = NewContact();
        contact.UpdatePersonalInfo(
            "Ada", "Lovelace", "Countess of Lovelace",
            null, null, null, null, "editor", Utc.AddHours(1));

        Assert.Equal("Countess of Lovelace", contact.DisplayName);
    }

    [Fact]
    public void Replace_phones_rejects_more_than_one_primary()
    {
        var contact = NewContact();

        Assert.Throws<DomainException>(() =>
            contact.ReplacePhones(
                [
                    new PhoneNumber("home", "+15551112222", isPrimary: true),
                    new PhoneNumber("work", "+15553334444", isPrimary: true)
                ],
                "editor", Utc.AddHours(1)));
    }

    [Fact]
    public void Replace_phones_allows_zero_primaries()
    {
        var contact = NewContact();
        contact.ReplacePhones(
            [new PhoneNumber("home", "+15551112222", isPrimary: false)],
            "editor", Utc.AddHours(1));

        Assert.Single(contact.Phones);
    }

    [Fact]
    public void Replace_emails_rejects_more_than_one_primary()
    {
        var contact = NewContact();

        Assert.Throws<DomainException>(() =>
            contact.ReplaceEmails(
                [
                    new EmailAddress("personal", "a@b.com", isPrimary: true),
                    new EmailAddress("work", "c@d.com", isPrimary: true)
                ],
                "editor", Utc.AddHours(1)));
    }

    [Fact]
    public void Replace_tags_dedupes_case_insensitively()
    {
        var contact = NewContact();

        contact.ReplaceTags(
            ["tag-A", "TAG-a", "tag-B"],
            "editor", Utc.AddHours(1));

        Assert.Equal(2, contact.TagIds.Count);
    }

    [Fact]
    public void Archive_flips_flag_and_raises_event()
    {
        var contact = NewContact();

        contact.Archive("editor", Utc.AddHours(1));

        Assert.True(contact.Archived);
        Assert.IsType<EntityArchivedDomainEvent>(Assert.Single(contact.DomainEvents));
    }

    [Fact]
    public void Archive_is_idempotent()
    {
        var contact = NewContact();
        contact.Archive("editor", Utc.AddHours(1));
        contact.ClearDomainEvents();

        contact.Archive("editor", Utc.AddHours(2));

        Assert.Empty(contact.DomainEvents);
    }

    [Fact]
    public void Soft_delete_redacts_personal_info_and_clears_collections()
    {
        var contact = NewContact();
        contact.ReplaceTags(["tag-1"], "editor", Utc.AddMinutes(1));
        contact.ReplacePhones(
            [new PhoneNumber("home", "+15551112222")],
            "editor", Utc.AddMinutes(2));

        contact.SoftDelete("editor", Utc.AddHours(1));

        Assert.True(contact.IsDeleted);
        Assert.True(contact.Archived);
        Assert.Equal("Deleted", contact.FirstName);
        Assert.Equal("Contact", contact.LastName);
        Assert.Equal("Deleted Contact", contact.DisplayName);
        Assert.Empty(contact.Phones);
        Assert.Empty(contact.TagIds);
        Assert.Contains(contact.DomainEvents, e => e is EntityDeletedDomainEvent);
    }

    [Fact]
    public void Soft_delete_is_idempotent()
    {
        var contact = NewContact();
        contact.SoftDelete("editor", Utc.AddHours(1));
        contact.ClearDomainEvents();

        contact.SoftDelete("editor", Utc.AddHours(2));

        Assert.Empty(contact.DomainEvents);
    }

    [Fact]
    public void Mutations_after_soft_delete_throw()
    {
        var contact = NewContact();
        contact.SoftDelete("editor", Utc.AddHours(1));

        Assert.Throws<DomainException>(() =>
            contact.UpdatePersonalInfo(
                "Bob", "Smith", null, null, null, null, null,
                "editor", Utc.AddHours(2)));

        Assert.Throws<DomainException>(() =>
            contact.SetAvatar("https://example.com/x.png", "editor", Utc.AddHours(2)));

        Assert.Throws<DomainException>(() =>
            contact.ReplaceTags(["tag-1"], "editor", Utc.AddHours(2)));
    }
}
