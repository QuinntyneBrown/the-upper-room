// traces_to: L2-034
namespace TheUpperRoom.Api.Partners;

public sealed record PartnerDto(
    string Id,
    string Name,
    string? Website,
    string CityId,
    int ContactCount,
    IReadOnlyList<TagRef> Tags,
    bool Archived,
    string? Logo = null,
    IReadOnlyList<SocialLinkDto>? SocialLinks = null);
