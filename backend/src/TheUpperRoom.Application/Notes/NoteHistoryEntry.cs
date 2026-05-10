namespace TheUpperRoom.Application.Notes;

public sealed record NoteHistoryEntry(
    string Id,
    string BodyMarkdown,
    string BodyHtmlSanitized,
    DateTimeOffset CreatedAt,
    string CreatedBy);
