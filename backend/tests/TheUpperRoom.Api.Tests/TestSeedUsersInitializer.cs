// Traces to: TASK-0234
using System.Runtime.CompilerServices;
using TheUpperRoom.Api.Rbac;

namespace TheUpperRoom.Api.Tests;

internal static class TestSeedUsersInitializer
{
    [ModuleInitializer]
    internal static void Init()
    {
        SeedUsers.ById["admin"] = new SeedUser("admin", "admin@test.local", "Toronto", Roles.SystemAdmin);
        SeedUsers.ById["lead"] = new SeedUser("lead", "lead@test.local", "Toronto", Roles.CityLead);
        SeedUsers.ById["member"] = new SeedUser("member", "member@test.local", "Toronto", Roles.Member);
        SeedUsers.ById["guest"] = new SeedUser("guest", "guest@test.local", "Toronto", Roles.Guest);
    }
}
