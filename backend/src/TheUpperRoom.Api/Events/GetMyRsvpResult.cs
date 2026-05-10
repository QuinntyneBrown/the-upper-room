namespace TheUpperRoom.Api.Events;

public sealed record GetMyRsvpResult(string? Status, int? WaitlistPosition, RsvpOutcome Outcome);
