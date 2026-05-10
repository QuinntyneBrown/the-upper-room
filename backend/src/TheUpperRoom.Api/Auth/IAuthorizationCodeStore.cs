namespace TheUpperRoom.Api.Auth;

/// <summary>
/// Maps short-lived authorization codes (issued by the dev IdP) to the user
/// they were issued for plus the PKCE code_challenge that must be matched by
/// the verifier sent to <c>/api/v1/auth/exchange</c>. Codes are single-use:
/// <see cref="Consume"/> removes them from the store.
/// </summary>
public interface IAuthorizationCodeStore
{
    string Issue(string userId, string codeChallenge);
    AuthorizationCodeRecord? Consume(string code);
}

public sealed record AuthorizationCodeRecord(string UserId, string CodeChallenge, DateTimeOffset IssuedAt);
