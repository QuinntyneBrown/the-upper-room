using TheUpperRoom.Application.Audit;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Application.Tests;

// AppUser and AuditEntryRecord are sealed records used as DTO surfaces.
// Pinning value-equality ensures handlers can compare them safely
// (e.g. for filtering, deduplication).
public sealed class AppUserAndAuditRecordTests
{
    [Fact]
    public void AppUser_records_with_same_fields_are_equal()
    {
        var a = new AppUser("u-1", "ada@example.com", "city-1", "Member");
        var b = new AppUser("u-1", "ada@example.com", "city-1", "Member");

        Assert.Equal(a, b);
        Assert.Equal(a.GetHashCode(), b.GetHashCode());
    }

    [Theory]
    [InlineData("u-2", "ada@example.com", "city-1", "Member")]
    [InlineData("u-1", "other@example.com", "city-1", "Member")]
    [InlineData("u-1", "ada@example.com", "city-2", "Member")]
    [InlineData("u-1", "ada@example.com", "city-1", "CityLead")]
    public void AppUser_records_differ_when_any_field_differs(
        string id, string email, string city, string role)
    {
        var canonical = new AppUser("u-1", "ada@example.com", "city-1", "Member");
        var other = new AppUser(id, email, city, role);

        Assert.NotEqual(canonical, other);
    }

    [Fact]
    public void AppUser_with_method_produces_modified_copy()
    {
        var canonical = new AppUser("u-1", "ada@example.com", "city-1", "Member");

        var promoted = canonical with { Role = "CityLead" };

        Assert.Equal("u-1", promoted.Id);
        Assert.Equal("CityLead", promoted.Role);
        Assert.Equal("Member", canonical.Role); // original unchanged
    }

    [Fact]
    public void AuditEntryRecord_pinned_field_order_matches_dto_wire_shape()
    {
        // Pinning the constructor's positional shape so it doesn't drift
        // out of step with AuditEntryDto (which the controller projects to).
        var t = new DateTimeOffset(2026, 5, 10, 12, 0, 0, TimeSpan.Zero);
        var record = new AuditEntryRecord(
            "rec-1", t, "actor-1", "Contact", "c-1", "Update",
            BeforeJson: "{\"a\":1}",
            AfterJson: "{\"a\":2}");

        Assert.Equal("rec-1", record.Id);
        Assert.Equal(t, record.Timestamp);
        Assert.Equal("actor-1", record.ActorUserId);
        Assert.Equal("Contact", record.EntityType);
        Assert.Equal("c-1", record.EntityId);
        Assert.Equal("Update", record.Action);
        Assert.Equal("{\"a\":1}", record.BeforeJson);
        Assert.Equal("{\"a\":2}", record.AfterJson);
    }

    [Fact]
    public void AuditEntryDto_field_order_mirrors_record()
    {
        // Same positional shape so callers can map record -> dto with
        // the same constructor argument list.
        var t = new DateTimeOffset(2026, 5, 10, 12, 0, 0, TimeSpan.Zero);
        var dto = new AuditEntryDto(
            "rec-1", t, "actor-1", "Contact", "c-1", "Update", null, null);

        Assert.Equal("rec-1", dto.Id);
        Assert.Null(dto.BeforeJson);
        Assert.Null(dto.AfterJson);
    }
}
