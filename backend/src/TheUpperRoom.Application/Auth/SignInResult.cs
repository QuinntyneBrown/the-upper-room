namespace TheUpperRoom.Application.Auth;

public sealed record SignInResult(SignInOutcome Outcome, string? UserId = null);
