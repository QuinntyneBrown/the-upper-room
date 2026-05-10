using TheUpperRoom.Domain.Audit;
using TheUpperRoom.Domain.Common;

namespace TheUpperRoom.Domain.Tests;

public sealed class AuditEntryTests
{
    private static readonly DateTimeOffset Utc = new(2026, 5, 10, 12, 0, 0, TimeSpan.Zero);

    private static AuditEntry NewEntry(
        DateTimeOffset? when = null,
        string? cityId = "toronto",
        string action = AuditActions.Update,
        string? beforeJson = "{\"name\":\"Old\"}",
        string? afterJson = "{\"name\":\"New\"}") =>
        new(
            when ?? Utc,
            actorUserId: "actor-1",
            cityId: cityId,
            entityType: "Contact",
            entityId: "contact-1",
            action: action,
            beforeJson: beforeJson,
            afterJson: afterJson,
            correlationId: "corr-1",
            ip: "192.0.2.1",
            userAgent: "xunit");

    [Fact]
    public void Constructs_with_all_required_fields()
    {
        var entry = NewEntry();

        Assert.Equal(Utc, entry.Timestamp);
        Assert.Equal("actor-1", entry.ActorUserId);
        Assert.Equal("toronto", entry.CityId);
        Assert.Equal("Contact", entry.EntityType);
        Assert.Equal("contact-1", entry.EntityId);
        Assert.Equal(AuditActions.Update, entry.Action);
        Assert.Equal("{\"name\":\"Old\"}", entry.BeforeJson);
        Assert.Equal("{\"name\":\"New\"}", entry.AfterJson);
        Assert.Equal("corr-1", entry.CorrelationId);
        Assert.Equal("192.0.2.1", entry.Ip);
        Assert.Equal("xunit", entry.UserAgent);
    }

    [Fact]
    public void City_id_is_optional()
    {
        var entry = NewEntry(cityId: null);

        Assert.Null(entry.CityId);
    }

    [Fact]
    public void Before_and_after_json_are_optional()
    {
        var entry = NewEntry(beforeJson: null, afterJson: null);

        Assert.Null(entry.BeforeJson);
        Assert.Null(entry.AfterJson);
    }

    [Fact]
    public void Non_utc_timestamp_throws()
    {
        var local = new DateTimeOffset(2026, 5, 10, 8, 0, 0, TimeSpan.FromHours(-4));

        Assert.Throws<DomainException>(() => NewEntry(when: local));
    }
}
