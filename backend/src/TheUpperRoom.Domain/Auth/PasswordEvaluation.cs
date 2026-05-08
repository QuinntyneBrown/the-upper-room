namespace TheUpperRoom.Domain.Auth;

public sealed record PasswordEvaluation(bool IsValid, int Score, string? Helper);
