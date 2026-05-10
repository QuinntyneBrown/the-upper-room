namespace TheUpperRoom.Api.Auth;

public sealed record ChangePasswordRequest(string? CurrentPassword, string? NewPassword);
