// traces_to: L2-015
namespace TheUpperRoom.Api.Auth;

// ExpectedChallenge is unused after BUG-003 (the challenge now lives on the
// IdP-issued authorization code record), but is kept nullable for backward
// compatibility with any older client that still sends it.
public sealed record ExchangeRequest(string Code, string CodeVerifier, string? ExpectedChallenge = null);
