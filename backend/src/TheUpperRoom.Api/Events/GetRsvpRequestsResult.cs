namespace TheUpperRoom.Api.Events;

public sealed record GetRsvpRequestsResult(PendingRsvpDto[] Items, RsvpOutcome Outcome);
