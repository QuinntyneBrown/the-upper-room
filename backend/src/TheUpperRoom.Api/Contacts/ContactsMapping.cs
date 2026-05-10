using TheUpperRoom.Infrastructure.Contacts;

namespace TheUpperRoom.Api.Contacts;

internal static class ContactsMapping
{
    public static Contact ToContact(ContactRow row) => new(row.Id, row.Name, row.CityId);
}
