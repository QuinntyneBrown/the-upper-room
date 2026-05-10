using TheUpperRoom.Application.Notes;

namespace TheUpperRoom.Application.Tests;

public sealed class NotesSanitizerTests
{
    [Theory]
    [InlineData("p")]
    [InlineData("h1")]
    [InlineData("ul")]
    [InlineData("a")]
    [InlineData("code")]
    [InlineData("strong")]
    public void Allowed_tag_passes_through(string tag)
    {
        var html = $"<{tag}>content</{tag}>";

        var sanitized = NotesSanitizer.Instance.Sanitize(html);

        Assert.Contains($"<{tag}", sanitized);
    }

    [Fact]
    public void Script_tag_is_stripped()
    {
        var sanitized = NotesSanitizer.Instance.Sanitize("<script>alert(1)</script>hello");

        Assert.DoesNotContain("<script", sanitized);
        Assert.Contains("hello", sanitized);
    }

    [Fact]
    public void Img_tag_is_not_in_allowlist()
    {
        // Only the allow-listed tags should pass; img is not in the list.
        var sanitized = NotesSanitizer.Instance.Sanitize("<img src=\"x\" />");

        Assert.DoesNotContain("<img", sanitized);
    }

    [Fact]
    public void To_dto_copies_row_fields()
    {
        var row = new NoteRow
        {
            Id = "n1",
            SubjectType = "Contact",
            SubjectId = "c1",
            BodyMarkdown = "raw",
            BodyHtmlSanitized = "safe",
            CreatedBy = "lead",
            CreatedAt = DateTimeOffset.UnixEpoch,
            UpdatedBy = "member",
            UpdatedAt = DateTimeOffset.UnixEpoch.AddDays(1),
            History =
            {
                new("v1", "old", "old-safe", DateTimeOffset.UnixEpoch, "lead"),
            },
        };

        var dto = NotesSanitizer.ToDto(row);

        Assert.Equal("n1", dto.Id);
        Assert.Equal("Contact", dto.SubjectType);
        Assert.Equal("safe", dto.BodyHtmlSanitized);
        Assert.Single(dto.History);
        Assert.Equal("v1", dto.History[0].Id);
    }
}
