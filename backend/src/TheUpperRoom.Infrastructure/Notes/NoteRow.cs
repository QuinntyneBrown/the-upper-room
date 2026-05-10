namespace TheUpperRoom.Infrastructure.Notes;

public sealed class NoteRow
{
    public string Id { get; set; } = "";
    public string SubjectType { get; set; } = "";
    public string SubjectId { get; set; } = "";
    public string BodyMarkdown { get; set; } = "";
    public string BodyHtmlSanitized { get; set; } = "";
    public string CreatedBy { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; }
    public string UpdatedBy { get; set; } = "";
    public DateTimeOffset UpdatedAt { get; set; }
    public List<NoteHistoryEntry> History { get; set; } = new();
}
