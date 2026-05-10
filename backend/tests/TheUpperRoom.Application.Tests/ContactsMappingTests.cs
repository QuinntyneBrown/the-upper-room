using TheUpperRoom.Application.Contacts;

namespace TheUpperRoom.Application.Tests;

public sealed class ContactsMappingTests
{
    [Fact]
    public void To_contact_copies_id_name_and_city()
    {
        var row = new ContactRow { Id = "c1", Name = "Alice", CityId = "Toronto", IsArchived = false };

        var contact = ContactsMapping.ToContact(row);

        Assert.Equal("c1", contact.Id);
        Assert.Equal("Alice", contact.Name);
        Assert.Equal("Toronto", contact.CityId);
    }

    [Fact]
    public void To_contact_does_not_leak_archived_flag()
    {
        // Contact (the outward DTO) has no IsArchived field; pin the rule
        // that this projection is intentionally narrow.
        var row = new ContactRow { Id = "c1", Name = "Alice", CityId = "Toronto", IsArchived = true };

        var contact = ContactsMapping.ToContact(row);

        // Sanity: the type itself only exposes Id/Name/CityId via record
        // positional parameters. Contracts the projection can't widen
        // without a Domain.Contact change.
        Assert.Equal(3, typeof(Contact).GetProperties().Length);
    }
}
