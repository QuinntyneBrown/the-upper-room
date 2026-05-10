using TheUpperRoom.Application.Contacts;
using TheUpperRoom.Application.Dashboard;
using TheUpperRoom.Application.Events;
using TheUpperRoom.Application.Notifications;

namespace TheUpperRoom.Application.Tests;

// Wire-shape records the SPA reads. Their property *order* is part of
// the contract because Microsoft.AspNetCore.Mvc's System.Text.Json
// serialiser emits camelCased property names matching declaration order.
// Renaming a record field would break the JSON shape for clients --
// pinning the constructor positional order surfaces such regressions.
public sealed class WireShapeRecordTests
{
    [Fact]
    public void NotificationPreferenceDto_positional_order_pinned()
    {
        var dto = new NotificationPreferenceDto("welcome", true, false, true);
        Assert.Equal("welcome", dto.Code);
        Assert.True(dto.InApp);
        Assert.False(dto.Email);
        Assert.True(dto.Push);
    }

    [Fact]
    public void NotificationPreferenceDto_records_with_same_fields_are_equal()
    {
        var a = new NotificationPreferenceDto("welcome", true, true, false);
        var b = new NotificationPreferenceDto("welcome", true, true, false);
        Assert.Equal(a, b);
        Assert.Equal(a.GetHashCode(), b.GetHashCode());
    }

    [Fact]
    public void AttendeeDto_positional_order_pinned()
    {
        var dto = new AttendeeDto("a-1", "Ada Lovelace", "https://example.com/a.png", "Going");
        Assert.Equal("a-1", dto.Id);
        Assert.Equal("Ada Lovelace", dto.Name);
        Assert.Equal("https://example.com/a.png", dto.AvatarUrl);
        Assert.Equal("Going", dto.RsvpStatus);
    }

    [Fact]
    public void PendingRsvpDto_positional_order_pinned()
    {
        var dto = new PendingRsvpDto("p-1", "u-1", "Ada Lovelace", "2026-05-10T12:00:00Z");
        Assert.Equal("p-1", dto.Id);
        Assert.Equal("u-1", dto.UserId);
        Assert.Equal("Ada Lovelace", dto.UserName);
        Assert.Equal("2026-05-10T12:00:00Z", dto.RequestedAt);
    }

    [Fact]
    public void Contact_record_implements_IHasCity_with_positional_order()
    {
        var c = new Contact("c-1", "Ada Lovelace", "city-1");
        Assert.Equal("c-1", c.Id);
        Assert.Equal("Ada Lovelace", c.Name);
        Assert.Equal("city-1", c.CityId);

        // IHasCity contract: city-scoped queries narrow by CityId.
        TheUpperRoom.Domain.Cities.IHasCity asCity = c;
        Assert.Equal("city-1", asCity.CityId);
    }

    [Fact]
    public void NotificationDto_positional_order_pinned()
    {
        var t = new DateTimeOffset(2026, 5, 10, 12, 0, 0, TimeSpan.Zero);
        var dto = new NotificationDto(
            "n-1", "welcome", "Welcome", "Hi there",
            new Dictionary<string, string> { ["k"] = "v" },
            Read: false,
            CreatedAt: t,
            DeepLink: "/home",
            Severity: "Info");

        Assert.Equal("n-1", dto.Id);
        Assert.Equal("welcome", dto.Code);
        Assert.Equal("Welcome", dto.Title);
        Assert.Equal("Hi there", dto.Body);
        Assert.False(dto.Read);
        Assert.Equal(t, dto.CreatedAt);
        Assert.Equal("/home", dto.DeepLink);
        Assert.Equal("Info", dto.Severity);
    }

    [Fact]
    public void DashboardStats_record_value_equality_and_field_order()
    {
        var a = new DashboardStats(Contacts: 12, Partners: 3, UpcomingEvents: 5, OpenIdeas: 2);
        var b = new DashboardStats(12, 3, 5, 2);
        Assert.Equal(a, b);
        Assert.Equal(12, a.Contacts);
        Assert.Equal(3, a.Partners);
        Assert.Equal(5, a.UpcomingEvents);
        Assert.Equal(2, a.OpenIdeas);
    }

    [Fact]
    public void EventDto_optional_arguments_default_to_null_or_false()
    {
        var dto = new EventDto(
            "e-1",
            "Title",
            CoverImageUrl: null,
            Status: "Scheduled",
            StartAt: DateTimeOffset.UnixEpoch,
            EndAt: DateTimeOffset.UnixEpoch.AddHours(2),
            Location: null,
            IsVirtual: false,
            RsvpCount: 0,
            Capacity: null,
            Tags: []);

        Assert.Null(dto.Description);
        Assert.Null(dto.Attendees);
        Assert.False(dto.RequiresApproval);
        Assert.Null(dto.RecurrenceRule);
        Assert.Null(dto.RecurrenceId);
        Assert.Null(dto.OccurrenceDate);
        Assert.Null(dto.ExceptionDates);
        Assert.Null(dto.Timezone);
    }
}
