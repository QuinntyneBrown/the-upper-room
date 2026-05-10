namespace TheUpperRoom.Api.Auth;

public sealed record AuthorizationCodeRecord(string UserId, string CodeChallenge, DateTimeOffset IssuedAt);
