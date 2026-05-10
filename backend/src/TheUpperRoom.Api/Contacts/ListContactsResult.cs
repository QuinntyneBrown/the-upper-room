namespace TheUpperRoom.Api.Contacts;

public sealed record ListContactsResult(Contact[] Items, int Total, ContactsOutcome Outcome);
