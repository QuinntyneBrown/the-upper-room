namespace TheUpperRoom.Api.Auth;

internal sealed record ForgotPasswordBucket(List<DateTimeOffset> RequestedAt);
