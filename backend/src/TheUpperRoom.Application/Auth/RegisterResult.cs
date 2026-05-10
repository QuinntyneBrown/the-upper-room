namespace TheUpperRoom.Application.Auth;

public sealed record RegisterResult(
    AuthMutationOutcome Outcome,
    string? UserId = null,
    string? EmailVerificationToken = null);
