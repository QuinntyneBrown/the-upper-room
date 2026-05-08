using System.Net.Mail;
using TheUpperRoom.Domain.Common;

namespace TheUpperRoom.Domain.Common.ValueObjects;

public sealed record EmailAddress
{
    public EmailAddress(string label, string address, bool isPrimary = false)
    {
        Label = Guard.Required(label, nameof(Label), 50);
        Address = Guard.Required(address, nameof(Address), 254).ToLowerInvariant();
        IsPrimary = isPrimary;

        try
        {
            _ = new MailAddress(Address);
        }
        catch (FormatException ex)
        {
            throw new DomainException("Enter a valid email address.", ex);
        }
    }

    public string Label { get; }

    public string Address { get; }

    public bool IsPrimary { get; }
}
