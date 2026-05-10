namespace TheUpperRoom.Application.Events;

public sealed record RsvpResponse(string RsvpStatus, int? WaitlistPosition = null, string? PromotedUser = null);
