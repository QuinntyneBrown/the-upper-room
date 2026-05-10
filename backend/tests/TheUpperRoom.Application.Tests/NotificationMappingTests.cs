using TheUpperRoom.Application.Notifications;

namespace TheUpperRoom.Application.Tests;

public sealed class NotificationMappingTests
{
    [Fact]
    public void Render_substitutes_brace_placeholders()
    {
        var rendered = NotificationMapping.Render(
            "Hello {name}, welcome to {city}!",
            new Dictionary<string, string> { ["name"] = "Alice", ["city"] = "Toronto" });

        Assert.Equal("Hello Alice, welcome to Toronto!", rendered);
    }

    [Fact]
    public void Render_leaves_unknown_placeholders_intact()
    {
        var rendered = NotificationMapping.Render(
            "Hi {missing}",
            new Dictionary<string, string> { ["other"] = "x" });

        Assert.Equal("Hi {missing}", rendered);
    }

    [Fact]
    public void Render_replaces_repeated_placeholders()
    {
        var rendered = NotificationMapping.Render(
            "{name} and {name}",
            new Dictionary<string, string> { ["name"] = "Bob" });

        Assert.Equal("Bob and Bob", rendered);
    }

    [Fact]
    public void Render_with_empty_data_returns_template_unchanged()
    {
        var template = "Untouched {x}";

        Assert.Equal(template, NotificationMapping.Render(template, new()));
    }

    [Fact]
    public void To_dto_copies_row_fields()
    {
        var row = new NotificationRow
        {
            Id = "n1",
            Code = "EventCancelled",
            Title = "Title",
            Body = "Body",
            Data = new() { ["k"] = "v" },
            Read = true,
            CreatedAt = new DateTimeOffset(2026, 5, 10, 12, 0, 0, TimeSpan.Zero),
            DeepLink = "/events/e1",
            Severity = "Info",
            UserId = "u",
        };

        var dto = NotificationMapping.ToDto(row);

        Assert.Equal("n1", dto.Id);
        Assert.Equal("EventCancelled", dto.Code);
        Assert.Equal("Title", dto.Title);
        Assert.Equal("Body", dto.Body);
        Assert.Equal("v", dto.Data["k"]);
        Assert.True(dto.Read);
        Assert.Equal(row.CreatedAt, dto.CreatedAt);
        Assert.Equal("/events/e1", dto.DeepLink);
        Assert.Equal("Info", dto.Severity);
    }
}
