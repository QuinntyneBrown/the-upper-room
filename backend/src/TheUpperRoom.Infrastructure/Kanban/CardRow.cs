namespace TheUpperRoom.Infrastructure.Kanban;

public sealed class CardRow
{
    public string Id { get; set; } = "";
    public string BoardId { get; set; } = "";
    public string ColumnId { get; set; } = "";
    public string Title { get; set; } = "";
    public string? AssigneeName { get; set; }
    public string? DueDate { get; set; }
    public int CardOrder { get; set; }
    public bool Archived { get; set; }
}
