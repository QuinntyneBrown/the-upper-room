// traces_to: L2-045
namespace TheUpperRoom.Api.Kanban;

public sealed record BoardCardDto(
    string Id,
    string ColumnId,
    string Title,
    BoardCardTagDto[] Tags,
    string? AssigneeName,
    string? DueDate,
    string? SwimlaneKey = null,
    bool Archived = false);
