namespace TheUpperRoom.Api.Auth;

public sealed record SignInRequest(string Email, string? Password);
