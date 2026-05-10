using TheUpperRoom.Domain.Common;
using TheUpperRoom.Domain.Notifications;

namespace TheUpperRoom.Domain.Tests;

public sealed class NotificationCatalogTests
{
    [Fact]
    public void All_codes_are_unique()
    {
        var codes = NotificationCatalog.All.Select(t => t.Code).ToArray();

        Assert.Equal(codes.Length, codes.Distinct(StringComparer.Ordinal).Count());
    }

    [Fact]
    public void All_returns_more_than_one_type()
    {
        Assert.NotEmpty(NotificationCatalog.All);
        Assert.True(NotificationCatalog.All.Count > 1);
    }

    [Fact]
    public void Require_returns_known_type()
    {
        var welcome = NotificationCatalog.Require("welcome");

        Assert.Equal("welcome", welcome.Code);
        Assert.Equal(NotificationSeverity.Info, welcome.Severity);
    }

    [Fact]
    public void Require_throws_for_unknown_code()
    {
        var ex = Assert.Throws<DomainException>(() =>
            NotificationCatalog.Require("not_a_real_code"));

        Assert.Contains("not_a_real_code", ex.Message);
    }

    [Fact]
    public void Every_template_is_non_empty()
    {
        Assert.All(NotificationCatalog.All, t =>
        {
            Assert.False(string.IsNullOrWhiteSpace(t.Title));
            Assert.False(string.IsNullOrWhiteSpace(t.BodyTemplate));
        });
    }

    [Fact]
    public void Security_events_are_warning_severity()
    {
        var passwordChanged = NotificationCatalog.Require("password_changed");
        var newDevice = NotificationCatalog.Require("signin_new_device");

        Assert.Equal(NotificationSeverity.Warning, passwordChanged.Severity);
        Assert.Equal(NotificationSeverity.Warning, newDevice.Severity);
    }
}
