using TheUpperRoom.Domain.Common;

namespace TheUpperRoom.Domain.Kanban;

public sealed class KanbanSwimlane : Entity
{
    public KanbanSwimlane(string boardId, string key, string name, int order, string? id = null) : base(id)
    {
        BoardId = Guard.Id(boardId, nameof(BoardId));
        Key = Guard.Required(key, nameof(Key), 100);
        Name = Guard.Required(name, nameof(Name), 100);
        Order = order;
    }

    public string BoardId { get; }

    public string Key { get; }

    public string Name { get; private set; }

    public int Order { get; private set; }
}
