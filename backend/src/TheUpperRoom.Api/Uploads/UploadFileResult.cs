namespace TheUpperRoom.Api.Uploads;

public sealed record UploadFileResult(string? Url, UploadFileOutcome Outcome, string? Error);
