using TheUpperRoom.Domain.Common;

namespace TheUpperRoom.Domain.Tests;

public sealed class SlugGeneratorTests
{
    [Theory]
    [InlineData("Hello World", "hello-world")]
    [InlineData("hello-world", "hello-world")]
    [InlineData("Hello   World", "hello-world")]
    [InlineData("HELLO WORLD", "hello-world")]
    public void Lowercases_and_collapses_whitespace_to_hyphens(string input, string expected)
    {
        Assert.Equal(expected, SlugGenerator.From(input));
    }

    [Fact]
    public void Strips_diacritics()
    {
        Assert.Equal("cafe", SlugGenerator.From("Café"));
        Assert.Equal("naive-resume", SlugGenerator.From("naïve résumé"));
    }

    [Theory]
    [InlineData("Foo & Bar", "foo-bar")]
    [InlineData("Hello, World!", "hello-world")]
    [InlineData("a/b/c", "a-b-c")]
    public void Replaces_punctuation_with_hyphen_separators(string input, string expected)
    {
        Assert.Equal(expected, SlugGenerator.From(input));
    }

    [Fact]
    public void Trims_leading_and_trailing_hyphens()
    {
        Assert.Equal("hello-world", SlugGenerator.From("---hello world---"));
    }

    [Fact]
    public void Empty_input_throws()
    {
        Assert.Throws<DomainException>(() => SlugGenerator.From(""));
    }

    [Fact]
    public void Numbers_and_letters_pass_through()
    {
        Assert.Equal("event-2026", SlugGenerator.From("Event 2026"));
    }
}
