namespace TheUpperRoom.Api.Auth;

public sealed record RegisterRequest(string Email, string? Password, string? City = null);
