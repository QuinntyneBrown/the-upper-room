namespace TheUpperRoom.Domain.Rbac;

public sealed record Permission(string Resource, string Action)
{
    public override string ToString() => $"{Resource}:{Action}";
}
