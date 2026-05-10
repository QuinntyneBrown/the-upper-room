namespace TheUpperRoom.Application.Events;

public sealed record SubmitRsvpResult(RsvpResponse? Response, RsvpOutcome Outcome);
