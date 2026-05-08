// traces_to: L2-015
namespace TheUpperRoom.Api.Auth;

public sealed record ExchangeRequest(string Code, string CodeVerifier, string ExpectedChallenge);
