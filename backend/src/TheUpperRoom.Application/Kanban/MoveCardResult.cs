namespace TheUpperRoom.Application.Kanban;

public sealed record MoveCardResult(object? Payload, KanbanOutcome Outcome);
