// traces_to: L2-023, TASK-0234
namespace TheUpperRoom.Api.Rbac;

/// <summary>
/// Mutable user-directory lookup. Empty by default in production; tests
/// register fixture users via a ModuleInitializer in the test assemblies.
/// </summary>
public static class SeedUsers
{
    public static IDictionary<string, SeedUser> ById { get; } = new Dictionary<string, SeedUser>();
}
