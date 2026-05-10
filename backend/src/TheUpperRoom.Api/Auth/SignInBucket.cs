namespace TheUpperRoom.Api.Auth;

internal sealed record SignInBucket(
    int AttemptCount,
    DateTimeOffset WindowStart,
    DateTimeOffset? LockUntil);
