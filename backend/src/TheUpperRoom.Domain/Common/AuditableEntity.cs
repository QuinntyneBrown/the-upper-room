namespace TheUpperRoom.Domain.Common;

public abstract class AuditableEntity : Entity
{
    private readonly List<IDomainEvent> _domainEvents = [];

    protected AuditableEntity(
        string createdBy,
        DateTimeOffset createdAt,
        string? id = null) : base(id)
    {
        CreatedBy = Guard.Id(createdBy, nameof(CreatedBy));
        CreatedAt = Guard.Utc(createdAt, nameof(CreatedAt));
        UpdatedBy = CreatedBy;
        UpdatedAt = CreatedAt;
    }

    public DateTimeOffset CreatedAt { get; private set; }

    public string CreatedBy { get; private set; }

    public DateTimeOffset UpdatedAt { get; private set; }

    public string UpdatedBy { get; private set; }

    public byte[] Version { get; private set; } = [];

    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    public void ClearDomainEvents() => _domainEvents.Clear();

    public void SetVersion(byte[] version) => Version = version.ToArray();

    protected void Touch(string updatedBy, DateTimeOffset updatedAt)
    {
        UpdatedBy = Guard.Id(updatedBy, nameof(updatedBy));
        UpdatedAt = Guard.Utc(updatedAt, nameof(updatedAt));
    }

    protected void Raise(IDomainEvent domainEvent) => _domainEvents.Add(domainEvent);
}
