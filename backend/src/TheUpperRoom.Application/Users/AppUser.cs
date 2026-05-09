namespace TheUpperRoom.Application.Users;

/// <summary>
/// Lightweight authenticated-user projection used by the Api/Application layers
/// to make authorization decisions. Replaces the SeedUser dictionary that
/// previously lived in Api.Rbac.
/// </summary>
public sealed record AppUser(string Id, string Email, string City, string Role);
