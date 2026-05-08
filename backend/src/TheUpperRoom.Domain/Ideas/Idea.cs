using TheUpperRoom.Domain.Common;

namespace TheUpperRoom.Domain.Ideas;

public sealed class Idea : CityScopedAuditableEntity
{
    private readonly List<string> _partnerIds = [];
    private readonly List<string> _tagIds = [];
    private readonly HashSet<string> _voteUserIds = new(StringComparer.OrdinalIgnoreCase);

    public Idea(
        string cityId,
        string title,
        string summary,
        string? descriptionMarkdown,
        string proposerUserId,
        string createdBy,
        DateTimeOffset createdAt,
        string? id = null) : base(cityId, createdBy, createdAt, id)
    {
        Title = Guard.Required(title, nameof(Title), 200);
        Summary = Guard.Required(summary, nameof(Summary), 500);
        DescriptionMarkdown = Guard.Optional(descriptionMarkdown, nameof(DescriptionMarkdown), 10000);
        ProposerUserId = Guard.Id(proposerUserId, nameof(ProposerUserId));
    }

    public string Title { get; private set; }

    public string Summary { get; private set; }

    public string? DescriptionMarkdown { get; private set; }

    public IdeaStatus Status { get; private set; } = IdeaStatus.Draft;

    public string ProposerUserId { get; private set; }

    public string? CoverImageUrl { get; private set; }

    public IReadOnlyCollection<string> PartnerIds => _partnerIds.AsReadOnly();

    public IReadOnlyCollection<string> TagIds => _tagIds.AsReadOnly();

    public IReadOnlyCollection<string> VoteUserIds => _voteUserIds.ToArray();

    public int VoteCount => _voteUserIds.Count;

    public void Update(
        string title,
        string summary,
        string? descriptionMarkdown,
        string? coverImageUrl,
        IEnumerable<string> partnerIds,
        IEnumerable<string> tagIds,
        string updatedBy,
        DateTimeOffset updatedAt)
    {
        Title = Guard.Required(title, nameof(Title), 200);
        Summary = Guard.Required(summary, nameof(Summary), 500);
        DescriptionMarkdown = Guard.Optional(descriptionMarkdown, nameof(DescriptionMarkdown), 10000);
        CoverImageUrl = Guard.OptionalHttpUrl(coverImageUrl, nameof(CoverImageUrl));
        ReplaceIds(_partnerIds, partnerIds, "Partner id");
        ReplaceIds(_tagIds, tagIds, "Tag id");
        Touch(updatedBy, updatedAt);
    }

    public void ChangeStatus(IdeaStatus status, string updatedBy, DateTimeOffset updatedAt)
    {
        var oldStatus = Status;
        Status = status;
        Touch(updatedBy, updatedAt);
        Raise(new EntityStatusChangedDomainEvent(
            nameof(Idea),
            Id,
            oldStatus.ToString(),
            status.ToString(),
            updatedBy,
            updatedAt));
    }

    public IdeaVoteChange ToggleVote(string userId, string updatedBy, DateTimeOffset updatedAt)
    {
        var normalized = Guard.Id(userId, nameof(userId));
        var change = _voteUserIds.Remove(normalized) ? IdeaVoteChange.Removed : IdeaVoteChange.Added;
        if (change == IdeaVoteChange.Added)
        {
            _voteUserIds.Add(normalized);
        }

        Touch(updatedBy, updatedAt);
        return change;
    }

    private static void ReplaceIds(List<string> target, IEnumerable<string> ids, string field)
    {
        target.Clear();
        target.AddRange(ids.Select(id => Guard.Id(id, field)).Distinct(StringComparer.OrdinalIgnoreCase));
    }
}
