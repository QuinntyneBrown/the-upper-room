namespace TheUpperRoom.Application.Contacts;

public static class ContactsMapping
{
    public static Contact ToContact(ContactRow row) => new(row.Id, row.Name, row.CityId);
}
