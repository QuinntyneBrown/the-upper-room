// traces_to: L2-019
namespace TheUpperRoom.Api.Auth;

public sealed record PasswordEvaluation(bool IsValid, int Score, string? Helper);
