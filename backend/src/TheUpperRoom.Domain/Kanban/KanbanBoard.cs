using TheUpperRoom.Domain.Common;
using TheUpperRoom.Domain.Tags;

namespace TheUpperRoom.Domain.Kanban;

public sealed class KanbanBoard : CityScopedAuditableEntity
{
    private readonly List<CardSchemaField> _cardSchema = [];
    private readonly List<KanbanColumn> _columns = [];
    private readonly List<KanbanSwimlane> _swimlanes = [];
    private readonly List<KanbanCard> _cards = [];

    public KanbanBoard(
        string cityId,
        string name,
        string? description,
        string createdBy,
        DateTimeOffset createdAt,
        string? id = null) : base(cityId, createdBy, createdAt, id)
    {
        Name = Guard.Required(name, nameof(Name), 100);
        Description = Guard.Optional(description, nameof(Description), 500);
    }

    public string Name { get; private set; }

    public string? Description { get; private set; }

    public int? WipLimitPerColumn { get; private set; }

    public IReadOnlyCollection<CardSchemaField> CardSchema => _cardSchema.AsReadOnly();

    public IReadOnlyCollection<KanbanColumn> Columns => _columns.OrderBy(column => column.Order).ToArray();

    public IReadOnlyCollection<KanbanSwimlane> Swimlanes => _swimlanes.OrderBy(swimlane => swimlane.Order).ToArray();

    public IReadOnlyCollection<KanbanCard> Cards => _cards.AsReadOnly();

    public void UpdateBasics(
        string name,
        string? description,
        int? wipLimitPerColumn,
        string updatedBy,
        DateTimeOffset updatedAt)
    {
        Name = Guard.Required(name, nameof(Name), 100);
        Description = Guard.Optional(description, nameof(Description), 500);
        WipLimitPerColumn = Guard.OptionalRange(wipLimitPerColumn, nameof(WipLimitPerColumn), 1, 10000);
        Touch(updatedBy, updatedAt);
    }

    public KanbanColumn AddColumn(string name, TagColor color, int? wipLimit, string createdBy, DateTimeOffset createdAt)
    {
        var column = new KanbanColumn(Id, name, _columns.Count, color, wipLimit);
        _columns.Add(column);
        Touch(createdBy, createdAt);
        return column;
    }

    public void UpdateColumn(string columnId, string name, TagColor color, int? wipLimit, string updatedBy, DateTimeOffset updatedAt)
    {
        var column = RequireColumn(columnId);
        column.Update(name, color, wipLimit);
        Touch(updatedBy, updatedAt);
    }

    public void ReorderColumns(IReadOnlyList<string> orderedColumnIds, string updatedBy, DateTimeOffset updatedAt)
    {
        if (orderedColumnIds.Count != _columns.Count
            || orderedColumnIds.Distinct(StringComparer.Ordinal).Count() != _columns.Count)
        {
            throw new DomainException("Column order must include each column exactly once.");
        }

        for (var index = 0; index < orderedColumnIds.Count; index++)
        {
            RequireColumn(orderedColumnIds[index]).SetOrder(index);
        }

        Touch(updatedBy, updatedAt);
    }

    public void ReplaceSchema(IEnumerable<CardSchemaField> fields, string updatedBy, DateTimeOffset updatedAt)
    {
        var materialized = fields.ToArray();
        if (materialized.Select(field => field.Key).Distinct(StringComparer.OrdinalIgnoreCase).Count() != materialized.Length)
        {
            throw new DomainException("Card schema field keys must be unique.");
        }

        _cardSchema.Clear();
        _cardSchema.AddRange(materialized);
        Touch(updatedBy, updatedAt);
    }

    public KanbanSwimlane AddSwimlane(string key, string name, string createdBy, DateTimeOffset createdAt)
    {
        var swimlane = new KanbanSwimlane(Id, key, name, _swimlanes.Count);
        _swimlanes.Add(swimlane);
        Touch(createdBy, createdAt);
        return swimlane;
    }

    public KanbanCard AddCard(
        string columnId,
        string? swimlaneKey,
        decimal position,
        IReadOnlyDictionary<string, string?> data,
        string? assigneeUserId,
        IEnumerable<string> tagIds,
        string createdBy,
        DateTimeOffset createdAt)
    {
        RequireColumn(columnId);
        EnsureColumnCanAcceptCard(columnId, null);
        ValidateCardData(data);

        var card = new KanbanCard(
            Id,
            columnId,
            swimlaneKey,
            position,
            data,
            assigneeUserId,
            tagIds,
            createdBy,
            createdAt);
        _cards.Add(card);
        Touch(createdBy, createdAt);
        return card;
    }

    public void MoveCard(
        string cardId,
        string targetColumnId,
        string? swimlaneKey,
        decimal position,
        string updatedBy,
        DateTimeOffset updatedAt)
    {
        var card = RequireCard(cardId);
        RequireColumn(targetColumnId);
        EnsureColumnCanAcceptCard(targetColumnId, card.Id);
        card.Move(targetColumnId, swimlaneKey, position, updatedBy, updatedAt);
        Touch(updatedBy, updatedAt);
    }

    private void EnsureColumnCanAcceptCard(string columnId, string? movingCardId)
    {
        var column = RequireColumn(columnId);
        var limit = column.WipLimit ?? WipLimitPerColumn;
        if (limit is null)
        {
            return;
        }

        var currentCount = _cards.Count(card =>
            !card.Archived
            && card.ColumnId == columnId
            && card.Id != movingCardId);

        if (currentCount >= limit)
        {
            throw new DomainException($"WIP limit reached for {column.Name}.");
        }
    }

    private void ValidateCardData(IReadOnlyDictionary<string, string?> data)
    {
        foreach (var field in _cardSchema.Where(field => field.Required))
        {
            if (!data.TryGetValue(field.Key, out var value) || string.IsNullOrWhiteSpace(value))
            {
                throw new DomainException($"{field.Label} is required.");
            }
        }
    }

    private KanbanColumn RequireColumn(string columnId) =>
        _columns.SingleOrDefault(column => column.Id == columnId)
        ?? throw new DomainException("Column was not found.");

    private KanbanCard RequireCard(string cardId) =>
        _cards.SingleOrDefault(card => card.Id == cardId)
        ?? throw new DomainException("Card was not found.");
}
