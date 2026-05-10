namespace TheUpperRoom.Api.Auth;

public sealed record AuthorizeRequest(
    string Email,
    string? Password,
    string CodeChallenge);
