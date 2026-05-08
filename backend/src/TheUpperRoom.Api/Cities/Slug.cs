// traces_to: L2-077
using System.Text;
using System.Text.RegularExpressions;

namespace TheUpperRoom.Api.Cities;

public static class Slug
{
    private static readonly Regex NonAlnum = new("[^a-z0-9]+", RegexOptions.Compiled);

    public static string From(string name)
    {
        var lower = name.Trim().ToLowerInvariant();
        var hyphenated = NonAlnum.Replace(lower, "-");
        return hyphenated.Trim('-');
    }
}
