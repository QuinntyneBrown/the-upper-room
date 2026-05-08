// traces_to: L2-032
namespace TheUpperRoom.Api.Contacts;

public sealed record CreateContactRequest(
    string FirstName,
    string? LastName,
    string? Pronouns,
    string? Title,
    string? Org,
    string? DisplayName);
