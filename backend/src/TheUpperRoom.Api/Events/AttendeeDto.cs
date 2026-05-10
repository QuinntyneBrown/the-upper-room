namespace TheUpperRoom.Api.Events;

public sealed record AttendeeDto(string Id, string Name, string? AvatarUrl, string RsvpStatus);
