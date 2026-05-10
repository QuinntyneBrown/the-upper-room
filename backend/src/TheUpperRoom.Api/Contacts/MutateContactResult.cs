namespace TheUpperRoom.Api.Contacts;

public sealed record MutateContactResult(Contact? Contact, ContactsOutcome Outcome, string? Error);
