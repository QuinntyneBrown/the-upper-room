namespace TheUpperRoom.Infrastructure.Ideas;

public sealed class IdeaRow
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string BodyMarkdown { get; set; } = "";
    public string BodyHtmlSanitized { get; set; } = "";
    public string? CoverImageUrl { get; set; }
    public string Status { get; set; } = "Draft";
    public string ProposedBy { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public string[] Tags { get; set; } = Array.Empty<string>();
}
