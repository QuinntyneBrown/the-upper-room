namespace TheUpperRoom.Application.Contacts;

public sealed record GetContactResult(Contact? Contact, ContactsOutcome Outcome);
