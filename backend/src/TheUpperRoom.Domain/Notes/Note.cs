using TheUpperRoom.Domain.Common;

namespace TheUpperRoom.Domain.Notes;

public sealed class Note : AuditableEntity
{
    public const int MaxHistoryVersions = 20;

    private readonly List<NoteVersion> _history = [];

    public Note(
        NoteSubjectType subjectType,
        string subjectId,
        string bodyMarkdown,
        string bodyHtmlSanitized,
        string createdBy,
        DateTimeOffset createdAt,
        string? id = null) : base(createdBy, createdAt, id)
    {
        SubjectType = subjectType;
        SubjectId = Guard.Id(subjectId, nameof(SubjectId));
        BodyMarkdown = Guard.Required(bodyMarkdown, nameof(BodyMarkdown), 10000);
        BodyHtmlSanitized = Guard.Required(bodyHtmlSanitized, nameof(BodyHtmlSanitized), 20000);
    }

    public NoteSubjectType SubjectType { get; private set; }

    public string SubjectId { get; private set; }

    public string BodyMarkdown { get; private set; }

    public string BodyHtmlSanitized { get; private set; }

    public IReadOnlyCollection<NoteVersion> History => _history.AsReadOnly();

    public void UpdateBody(string bodyMarkdown, string bodyHtmlSanitized, string updatedBy, DateTimeOffset updatedAt)
    {
        _history.Insert(0, new NoteVersion(
            DomainId.New(),
            BodyMarkdown,
            BodyHtmlSanitized,
            UpdatedAt,
            UpdatedBy));

        if (_history.Count > MaxHistoryVersions)
        {
            _history.RemoveRange(MaxHistoryVersions, _history.Count - MaxHistoryVersions);
        }

        BodyMarkdown = Guard.Required(bodyMarkdown, nameof(BodyMarkdown), 10000);
        BodyHtmlSanitized = Guard.Required(bodyHtmlSanitized, nameof(BodyHtmlSanitized), 20000);
        Touch(updatedBy, updatedAt);
    }
}
