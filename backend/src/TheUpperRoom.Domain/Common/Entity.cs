namespace TheUpperRoom.Domain.Common;

public abstract class Entity
{
    protected Entity(string? id = null)
    {
        Id = string.IsNullOrWhiteSpace(id) ? DomainId.New() : id.Trim();
    }

    public string Id { get; private set; }
}
