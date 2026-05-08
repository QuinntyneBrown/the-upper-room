using TheUpperRoom.Domain.Common;
using TheUpperRoom.Domain.Tags;

namespace TheUpperRoom.Domain.Kanban;

public sealed class KanbanColumn : Entity
{
    public KanbanColumn(string boardId, string name, int order, TagColor color, int? wipLimit, string? id = null) : base(id)
    {
        BoardId = Guard.Id(boardId, nameof(BoardId));
        Name = Guard.Required(name, nameof(Name), 100);
        Order = order;
        Color = color;
        WipLimit = Guard.OptionalRange(wipLimit, nameof(WipLimit), 1, 10000);
    }

    public string BoardId { get; }

    public string Name { get; private set; }

    public int Order { get; private set; }

    public TagColor Color { get; private set; }

    public int? WipLimit { get; private set; }

    public void Update(string name, TagColor color, int? wipLimit)
    {
        Name = Guard.Required(name, nameof(Name), 100);
        Color = color;
        WipLimit = Guard.OptionalRange(wipLimit, nameof(WipLimit), 1, 10000);
    }

    public void SetOrder(int order) => Order = order;
}
