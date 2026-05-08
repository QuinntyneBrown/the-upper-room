namespace TheUpperRoom.Domain.Common;

public static class DomainId
{
    public static string New() => Guid.CreateVersion7().ToString();
}
