using TheUpperRoom.Domain.Common;

namespace TheUpperRoom.Domain.Kanban;

public sealed record CardSchemaField
{
    public CardSchemaField(
        string key,
        KanbanFieldType type,
        string label,
        bool required,
        IEnumerable<string>? options = null)
    {
        Key = Guard.Required(key, nameof(Key), 50);
        Type = type;
        Label = Guard.Required(label, nameof(Label), 100);
        Required = required;
        Options = (options ?? []).Select(option => Guard.Required(option, nameof(Options), 100)).ToArray();
    }

    public string Key { get; }

    public KanbanFieldType Type { get; }

    public string Label { get; }

    public bool Required { get; }

    public IReadOnlyCollection<string> Options { get; }
}
