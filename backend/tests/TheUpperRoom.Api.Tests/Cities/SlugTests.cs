// traces_to: L2-077
using TheUpperRoom.Api.Cities;

namespace TheUpperRoom.Api.Tests.Cities;

public sealed class SlugTests
{
    [Theory]
    [InlineData("Toronto", "toronto")]
    [InlineData("New York", "new-york")]
    [InlineData("  Halifax  ", "halifax")]
    [InlineData("San Francisco / Bay Area", "san-francisco-bay-area")]
    public void From_lowercases_and_hyphenates(string input, string expected)
    {
        Assert.Equal(expected, Slug.From(input));
    }
}
