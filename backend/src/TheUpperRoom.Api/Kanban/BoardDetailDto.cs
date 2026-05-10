// traces_to: L2-045
namespace TheUpperRoom.Api.Kanban;

public sealed record BoardDetailDto(
    string Id,
    string Name,
    string? Description,
    BoardColumnDto[] Columns,
    BoardCardDto[] Cards,
    string? SwimlaneMode = null);
