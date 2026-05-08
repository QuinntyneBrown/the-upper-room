using TheUpperRoom.Domain.Common;

namespace TheUpperRoom.Domain.Partners;

public sealed record PartnerContactLink
{
    public PartnerContactLink(string contactId, string role)
    {
        ContactId = Guard.Id(contactId, nameof(ContactId));
        Role = Guard.Required(role, nameof(Role), 100);
    }

    public string ContactId { get; }

    public string Role { get; }
}
