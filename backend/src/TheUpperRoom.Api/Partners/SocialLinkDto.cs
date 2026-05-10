namespace TheUpperRoom.Api.Partners;

public sealed record SocialLinkDto(string Platform, string Url, string? Label = null);
