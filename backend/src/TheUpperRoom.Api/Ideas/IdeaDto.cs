// traces_to: L2-048, L2-049, L2-050, L2-051
namespace TheUpperRoom.Api.Ideas;

public sealed record LinkedPartnerRefDto(string Id, string Name);

public sealed record IdeaDto(
    string Id,
    string Title,
    string Description,
    string BodyMarkdown,
    string BodyHtmlSanitized,
    string? CoverImageUrl,
    string Status,
    int VoteCount,
    bool HasVoted,
    string ProposedBy,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    string[] Tags,
    IReadOnlyList<LinkedPartnerRefDto>? LinkedPartners = null);
