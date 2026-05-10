// traces_to: L2-045
namespace TheUpperRoom.Api.Kanban;

public sealed record BoardColumnDto(string Id, string Name, string Color, int? WipLimit = null);
