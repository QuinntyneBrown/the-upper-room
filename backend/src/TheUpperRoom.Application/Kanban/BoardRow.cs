namespace TheUpperRoom.Application.Kanban;

public sealed class BoardRow
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public DateTimeOffset LastActivityAt { get; set; } = DateTimeOffset.UtcNow;
    public string SwimlaneMode { get; set; } = "None";
}
