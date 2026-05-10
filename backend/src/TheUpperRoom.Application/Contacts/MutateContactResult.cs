namespace TheUpperRoom.Application.Contacts;

public sealed record MutateContactResult(Contact? Contact, ContactsOutcome Outcome, string? Error);
