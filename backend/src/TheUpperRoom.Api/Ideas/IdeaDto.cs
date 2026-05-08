// traces_to: L2-048, L2-049
namespace TheUpperRoom.Api.Ideas;

public sealed record IdeaDto(
    string Id,
    string Title,
    string Description,
    string Status,
    int VoteCount,
    bool HasVoted,
    string ProposedBy,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    string[] Tags);
