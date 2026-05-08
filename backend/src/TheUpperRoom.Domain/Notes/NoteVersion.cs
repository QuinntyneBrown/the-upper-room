namespace TheUpperRoom.Domain.Notes;

public sealed record NoteVersion(
    string Id,
    string BodyMarkdown,
    string BodyHtmlSanitized,
    DateTimeOffset CreatedAt,
    string CreatedBy);
