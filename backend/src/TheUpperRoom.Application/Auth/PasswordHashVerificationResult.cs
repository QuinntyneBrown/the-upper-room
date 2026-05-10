namespace TheUpperRoom.Application.Auth;

public enum PasswordHashVerificationResult
{
    Failed = 0,
    Success = 1,
    Rehash = 2,
}
