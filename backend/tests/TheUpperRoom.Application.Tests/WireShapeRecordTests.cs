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
