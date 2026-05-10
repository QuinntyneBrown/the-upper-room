namespace TheUpperRoom.Api.Notes;

public sealed record NoteVersionDto(string Id, string BodyMarkdown, string BodyHtmlSanitized, DateTimeOffset CreatedAt, string CreatedBy);
