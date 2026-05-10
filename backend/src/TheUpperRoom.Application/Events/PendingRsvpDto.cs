namespace TheUpperRoom.Application.Events;

public sealed record PendingRsvpDto(string Id, string UserId, string UserName, string RequestedAt);
