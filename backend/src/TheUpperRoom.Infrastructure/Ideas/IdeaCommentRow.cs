namespace TheUpperRoom.Infrastructure.Ideas;

public sealed class IdeaCommentRow
{
    public string Id { get; set; } = "";
    public string IdeaId { get; set; } = "";
    public string Author { get; set; } = "";
    public string Body { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; }
}
