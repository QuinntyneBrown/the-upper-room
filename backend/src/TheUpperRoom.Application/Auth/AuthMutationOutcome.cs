namespace TheUpperRoom.Application.Auth;

public enum AuthMutationOutcome
{
    Success,
    Created,
    Conflict,
    InvalidCredentials,
    InvalidToken,
    NotFound,
}
