namespace TheUpperRoom.Domain.Common.ValueObjects;

public sealed record PhoneNumber
{
    public PhoneNumber(string label, string number, bool isPrimary = false)
    {
        Label = Guard.Required(label, nameof(Label), 50);
        Number = Guard.E164Phone(number, nameof(Number));
        IsPrimary = isPrimary;
    }

    public string Label { get; }

    public string Number { get; }

    public bool IsPrimary { get; }
}
