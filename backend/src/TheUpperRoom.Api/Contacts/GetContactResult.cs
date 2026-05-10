namespace TheUpperRoom.Api.Contacts;

public sealed record GetContactResult(Contact? Contact, ContactsOutcome Outcome);
