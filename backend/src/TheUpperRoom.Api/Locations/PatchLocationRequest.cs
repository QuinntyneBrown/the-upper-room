namespace TheUpperRoom.Api.Locations;

public sealed record PatchLocationRequest(bool? Archived, string? Name);
