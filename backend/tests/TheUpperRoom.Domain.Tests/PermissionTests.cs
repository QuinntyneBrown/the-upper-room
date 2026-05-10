using TheUpperRoom.Domain.Rbac;

namespace TheUpperRoom.Domain.Tests;

public sealed class PermissionTests
{
    [Fact]
    public void To_string_uses_resource_colon_action_format()
    {
        // The "Resource:Action" string is the wire shape exposed via
        // /api/me's permissions[] field. Pinning it.
        var p = new Permission("Contact", "Read");

        Assert.Equal("Contact:Read", p.ToString());
    }

    [Fact]
    public void Records_with_same_resource_and_action_are_equal()
    {
        var a = new Permission("Contact", "Read");
        var b = new Permission("Contact", "Read");

        Assert.Equal(a, b);
        Assert.Equal(a.GetHashCode(), b.GetHashCode());
    }

    [Fact]
    public void Records_differ_when_action_differs()
    {
        Assert.NotEqual(
            new Permission("Contact", "Read"),
            new Permission("Contact", "Update"));
    }

    [Fact]
    public void Records_differ_when_resource_differs()
    {
        Assert.NotEqual(
            new Permission("Contact", "Read"),
            new Permission("Partner", "Read"));
    }
}
