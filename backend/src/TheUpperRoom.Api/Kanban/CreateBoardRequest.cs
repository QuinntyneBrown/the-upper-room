// traces_to: L2-043, L2-044
namespace TheUpperRoom.Api.Kanban;

public sealed record CreateBoardRequest(string? Name, string? Description, bool DefaultColumns);
