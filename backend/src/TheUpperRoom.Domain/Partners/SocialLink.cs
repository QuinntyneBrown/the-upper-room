using TheUpperRoom.Domain.Common;

namespace TheUpperRoom.Domain.Partners;

public sealed record SocialLink
{
    public SocialLink(SocialPlatform platform, string url)
    {
        Platform = platform;
        Url = Guard.RequiredHttpUrl(url, nameof(Url));
    }

    public SocialPlatform Platform { get; }

    public string Url { get; }
}
