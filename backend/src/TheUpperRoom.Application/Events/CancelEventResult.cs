namespace TheUpperRoom.Application.Events;

public sealed record CancelEventResult(EventDto? Event, CancelEventOutcome Outcome);
