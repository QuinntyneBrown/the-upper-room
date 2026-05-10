namespace TheUpperRoom.Api.Events;

public sealed record CancelEventResult(EventDto? Event, CancelEventOutcome Outcome);
