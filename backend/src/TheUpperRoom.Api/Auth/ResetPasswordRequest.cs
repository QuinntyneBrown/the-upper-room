namespace TheUpperRoom.Api.Auth;

public sealed record ResetPasswordRequest(string Token, string? NewPassword);
