namespace TheUpperRoom.Api.Events;

public sealed record RsvpResponse(string RsvpStatus, int? WaitlistPosition = null, string? PromotedUser = null);
