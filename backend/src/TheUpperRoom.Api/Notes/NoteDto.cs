// traces_to: L2-041
using TheUpperRoom.Domain.Notes;

namespace TheUpperRoom.Api.Notes;

public sealed record NoteDto(
    string Id,
    string SubjectType,
    string SubjectId,
    string BodyMarkdown,
    string BodyHtmlSanitized,
    NoteVersionDto[] History)
{
    public static NoteDto From(Note note) => new(
        note.Id,
        note.SubjectType.ToString(),
        note.SubjectId,
        note.BodyMarkdown,
        note.BodyHtmlSanitized,
        note.History.Select(v => new NoteVersionDto(v.Id, v.BodyMarkdown, v.BodyHtmlSanitized)).ToArray());
}

public sealed record NoteVersionDto(string Id, string BodyMarkdown, string BodyHtmlSanitized);
