using Ganss.Xss;

namespace TheUpperRoom.Application.Notes;

internal static class NotesSanitizer
{
    private static readonly HtmlSanitizer _sanitizer = Build();

    public static HtmlSanitizer Instance => _sanitizer;

    private static HtmlSanitizer Build()
    {
        var s = new HtmlSanitizer();
        s.AllowedTags.Clear();
        s.AllowedTags.UnionWith(["p", "h1", "h2", "h3", "h4", "h5", "h6",
            "ul", "ol", "li", "a", "code", "pre", "em", "strong", "blockquote", "br"]);
        return s;
    }

    public static NoteDto ToDto(NoteRow r) => new(
        r.Id, r.SubjectType, r.SubjectId, r.BodyMarkdown, r.BodyHtmlSanitized,
        r.CreatedBy, r.CreatedAt, r.UpdatedAt,
        r.History.Select(h => new NoteVersionDto(h.Id, h.BodyMarkdown, h.BodyHtmlSanitized, h.CreatedAt, h.CreatedBy)).ToArray());
}
