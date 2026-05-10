namespace TheUpperRoom.Application.Auth;

public sealed record AuthUser(
    string Id,
    string Email,
    string? PasswordHash,
    bool EmailVerified);
