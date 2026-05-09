// traces_to: L2-045
namespace TheUpperRoom.Api.Kanban;

public sealed record BoardColumnDto(string Id, string Name, string Color, int? WipLimit = null);

public sealed record BoardCardTagDto(string Id, string Name, string Color);

public sealed record BoardCardDto(
    string Id,
    string ColumnId,
    string Title,
    BoardCardTagDto[] Tags,
    string? AssigneeName,
    string? DueDate,
    string? SwimlaneKey = null);

public sealed record BoardDetailDto(
    string Id,
    string Name,
    string? Description,
    BoardColumnDto[] Columns,
    BoardCardDto[] Cards,
    string? SwimlaneMode = null);
