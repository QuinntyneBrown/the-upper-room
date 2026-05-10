namespace TheUpperRoom.Api.Kanban;

public sealed record MoveCardRequest(string? TargetColumnId, string? SourceColumnId);
