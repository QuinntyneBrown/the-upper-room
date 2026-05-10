using TheUpperRoom.Application.Events;

namespace TheUpperRoom.Application.Tests;

public sealed class EventsMappingTests
{
    private static EventRow Sample() => new()
    {
        Id = "e1",
        Title = "Build Night",
        Status = "Scheduled",
        StartAt = new DateTimeOffset(2026, 6, 1, 18, 0, 0, TimeSpan.Zero),
        EndAt = new DateTimeOffset(2026, 6, 1, 20, 0, 0, TimeSpan.Zero),
        Location = "HQ",
        IsVirtual = false,
        Capacity = 30,
        RequiresApproval = false,
        Description = "Hack stuff.",
        Tags = ["build", "social"],
        RecurrenceRule = null,
        ExceptionDates = Array.Empty<string>(),
        Timezone = "America/Toronto",
    };

    [Fact]
    public void Maps_scalar_fields()
    {
        var dto = Sample().ToDto();

        Assert.Equal("e1", dto.Id);
        Assert.Equal("Build Night", dto.Title);
        Assert.Equal("Scheduled", dto.Status);
        Assert.Equal("HQ", dto.Location);
        Assert.False(dto.IsVirtual);
        Assert.Equal(30, dto.Capacity);
        Assert.Equal("America/Toronto", dto.Timezone);
        Assert.Equal(new[] { "build", "social" }, dto.Tags);
    }

    [Fact]
    public void Empty_exception_dates_array_maps_to_null()
    {
        // EventDto signals "no exceptions" via null rather than empty array;
        // pin the rule.
        var dto = Sample().ToDto();

        Assert.Null(dto.ExceptionDates);
    }

    [Fact]
    public void Non_empty_exception_dates_pass_through()
    {
        var row = Sample();
        row.ExceptionDates = ["2026-06-08", "2026-06-15"];

        var dto = row.ToDto();

        Assert.Equal(new[] { "2026-06-08", "2026-06-15" }, dto.ExceptionDates);
    }

    [Fact]
    public void Default_rsvp_count_is_zero_and_attendees_null()
    {
        var dto = Sample().ToDto();

        Assert.Equal(0, dto.RsvpCount);
        Assert.Null(dto.Attendees);
    }

    [Fact]
    public void Caller_supplied_rsvp_count_and_attendees_pass_through()
    {
        var attendees = new List<AttendeeDto>
        {
            new("u1", "Alice", null, "Going"),
            new("u2", "Bob", null, "Maybe"),
        };

        var dto = Sample().ToDto(rsvpCount: 5, attendees: attendees);

        Assert.Equal(5, dto.RsvpCount);
        Assert.NotNull(dto.Attendees);
        Assert.Equal(2, dto.Attendees.Count);
        Assert.Equal("Alice", dto.Attendees[0].Name);
    }

    [Fact]
    public void Cover_image_url_is_always_null()
    {
        // EventRow has no cover-image column today; the DTO field is for
        // future use. Pin the current behaviour so a regression that
        // populates this from somewhere unexpected fails the test.
        Assert.Null(Sample().ToDto().CoverImageUrl);
    }
}
