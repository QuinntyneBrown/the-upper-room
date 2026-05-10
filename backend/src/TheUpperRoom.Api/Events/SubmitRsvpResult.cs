namespace TheUpperRoom.Api.Events;

public sealed record SubmitRsvpResult(RsvpResponse? Response, RsvpOutcome Outcome);
