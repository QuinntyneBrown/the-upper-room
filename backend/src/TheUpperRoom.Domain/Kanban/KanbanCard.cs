using TheUpperRoom.Domain.Common;

namespace TheUpperRoom.Domain.Kanban;

public sealed class KanbanCard : AuditableEntity
{
    private readonly Dictionary<string, string?> _data;
    private readonly List<string> _tagIds;

    private KanbanCard() : base("ef", DateTimeOffset.UnixEpoch)
    {
        BoardId = string.Empty;
        ColumnId = string.Empty;
        _data = [];
        _tagIds = [];
    }

    public KanbanCard(
        string boardId,
        string columnId,
        string? swimlaneKey,
        decimal position,
        IReadOnlyDictionary<string, string?> data,
        string? assigneeUserId,
        IEnumerable<string> tagIds,
        string createdBy,
        DateTimeOffset createdAt,
        string? id = null) : base(createdBy, createdAt, id)
    {
        BoardId = Guard.Id(boardId, nameof(BoardId));
        ColumnId = Guard.Id(columnId, nameof(ColumnId));
        SwimlaneKey = Guard.Optional(swimlaneKey, nameof(SwimlaneKey), 100);
        Position = position;
        _data = data.ToDictionary(pair => pair.Key, pair => pair.Value, StringComparer.OrdinalIgnoreCase);
        AssigneeUserId = Guard.Optional(assigneeUserId, nameof(AssigneeUserId), 100);
        _tagIds = tagIds.Select(idValue => Guard.Id(idValue, "Tag id")).Distinct(StringComparer.OrdinalIgnoreCase).ToList();
    }

    public string BoardId { get; }

    public string ColumnId { get; private set; }

    public string? SwimlaneKey { get; private set; }

    public decimal Position { get; private set; }

    public IReadOnlyDictionary<string, string?> Data => _data;

    public string? AssigneeUserId { get; private set; }

    public IReadOnlyCollection<string> TagIds => _tagIds.AsReadOnly();

    public bool Archived { get; private set; }

    public void Move(string columnId, string? swimlaneKey, decimal position, string updatedBy, DateTimeOffset updatedAt)
    {
        ColumnId = Guard.Id(columnId, nameof(columnId));
        SwimlaneKey = Guard.Optional(swimlaneKey, nameof(swimlaneKey), 100);
        Position = position;
        Touch(updatedBy, updatedAt);
    }

    public void Archive(string updatedBy, DateTimeOffset updatedAt)
    {
        Archived = true;
        Touch(updatedBy, updatedAt);
        Raise(new EntityArchivedDomainEvent(nameof(KanbanCard), Id, updatedBy, updatedAt));
    }
}
