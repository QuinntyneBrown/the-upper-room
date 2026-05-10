namespace TheUpperRoom.Api.Ideas;

public sealed record CreateIdeaRequest(
    string? Title,
    string? Description = null,
    string? BodyMarkdown = null,
    string[]? Tags = null);
