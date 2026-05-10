namespace TheUpperRoom.Api.Kanban;

public sealed record PatchColumnRequest(int? WipLimit, string? Name, string? Color);
