using TheUpperRoom.Application.Contacts;

namespace TheUpperRoom.Application.Tests;

public sealed class ContactsDisplayNameTests
{
    [Fact]
    public void First_and_last_name_concatenate_with_space()
    {
        var name = ContactsDisplayName.Build(
            new CreateContactRequest("Alice", "Jones", null, null, null, null));

        Assert.Equal("Alice Jones", name);
    }

    [Fact]
    public void Trims_whitespace_around_components()
    {
        var name = ContactsDisplayName.Build(
            new CreateContactRequest("  Alice ", "  Jones  ", null, null, null, null));

        Assert.Equal("Alice Jones", name);
    }

    [Fact]
    public void First_name_only_omits_separator()
    {
        var name = ContactsDisplayName.Build(
            new CreateContactRequest("Alice", null, null, null, null, null));

        Assert.Equal("Alice", name);
    }

    [Fact]
    public void Empty_last_name_omits_separator()
    {
        var name = ContactsDisplayName.Build(
            new CreateContactRequest("Alice", string.Empty, null, null, null, null));

        Assert.Equal("Alice", name);
    }

    [Fact]
    public void Whitespace_only_last_name_omits_separator()
    {
        var name = ContactsDisplayName.Build(
            new CreateContactRequest("Alice", "   ", null, null, null, null));

        Assert.Equal("Alice", name);
    }

    [Fact]
    public void Explicit_display_name_overrides_first_last()
    {
        var name = ContactsDisplayName.Build(
            new CreateContactRequest("Alice", "Jones", null, null, null, "Lady A"));

        Assert.Equal("Lady A", name);
    }

    [Fact]
    public void Display_name_is_passed_through_verbatim()
    {
        // Note the existing implementation does not trim DisplayName;
        // pinning the current behavior so callers (frontend) know what
        // they get back.
        var name = ContactsDisplayName.Build(
            new CreateContactRequest("Alice", "Jones", null, null, null, "  Lady A  "));

        Assert.Equal("  Lady A  ", name);
    }
}
