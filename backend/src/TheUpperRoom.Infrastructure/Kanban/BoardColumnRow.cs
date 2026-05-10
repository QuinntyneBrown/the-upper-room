namespace TheUpperRoom.Infrastructure.Kanban;

public sealed class BoardColumnRow
{
    public string Id { get; set; } = "";
    public string BoardId { get; set; } = "";
    public string Name { get; set; } = "";
    public string Color { get; set; } = "blue";
    public int? WipLimit { get; set; }
    public int ColumnOrder { get; set; }
}
