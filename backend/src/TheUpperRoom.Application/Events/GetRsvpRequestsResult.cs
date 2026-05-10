namespace TheUpperRoom.Application.Events;

public sealed record GetRsvpRequestsResult(PendingRsvpDto[] Items, RsvpOutcome Outcome);
