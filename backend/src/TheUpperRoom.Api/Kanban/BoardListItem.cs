// traces_to: L2-043, L2-044
namespace TheUpperRoom.Api.Kanban;

public sealed record BoardListItem(
    string Id,
    string Name,
    string? Description,
    int ColumnCount,
    int CardCount,
    DateTimeOffset LastActivityAt);
