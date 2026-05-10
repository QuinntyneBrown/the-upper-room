namespace TheUpperRoom.Api.Search;

public sealed record SearchResult(string Id, string Type, string Title, string? Subtitle, string Url);
