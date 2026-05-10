namespace TheUpperRoom.Application.Contacts;

public static class ContactsDisplayName
{
    public static string Build(CreateContactRequest body)
    {
        var name = string.Join(
            ' ',
            new[] { body.FirstName.Trim(), body.LastName?.Trim() }
                .Where(s => !string.IsNullOrEmpty(s)));
        return body.DisplayName ?? name;
    }
}
