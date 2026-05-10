namespace TheUpperRoom.Api.Locations;

public sealed record UpsertLocationRequest(
    string Name, string? Street, string? City, string? State,
    string? Country, string? PostalCode, int? Capacity, double? Lat, double? Lng);
