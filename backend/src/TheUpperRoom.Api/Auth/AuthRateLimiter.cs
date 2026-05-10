using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;

namespace TheUpperRoom.Api.Auth;

internal sealed class AuthRateLimiter : IAuthRateLimiter
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly IDistributedCache _cache;

    public AuthRateLimiter(IDistributedCache cache)
    {
        _cache = cache;
    }

    public async Task<bool> IsSignInLockedAsync(
        string email,
        DateTimeOffset now,
        CancellationToken cancellationToken = default)
    {
        var bucket = await GetAsync<SignInBucket>(SignInKey(email), cancellationToken).ConfigureAwait(false);
        if (bucket?.LockUntil is null)
        {
            return false;
        }

        if (now < bucket.LockUntil)
        {
            return true;
        }

        await _cache.RemoveAsync(SignInKey(email), cancellationToken).ConfigureAwait(false);
        return false;
    }

    public async Task<bool> RecordFailedSignInAsync(
        string email,
        DateTimeOffset now,
        CancellationToken cancellationToken = default)
    {
        var key = SignInKey(email);
        var bucket = await GetAsync<SignInBucket>(key, cancellationToken).ConfigureAwait(false)
            ?? new SignInBucket(0, now, null);

        if (now - bucket.WindowStart > TimeSpan.FromMinutes(15))
        {
            bucket = new SignInBucket(0, now, null);
        }

        bucket = bucket with { AttemptCount = bucket.AttemptCount + 1 };
        if (bucket.AttemptCount > 5)
        {
            bucket = bucket with { LockUntil = now.AddMinutes(30) };
        }

        await SetAsync(key, bucket, TimeSpan.FromMinutes(31), cancellationToken).ConfigureAwait(false);
        return bucket.LockUntil is not null && now < bucket.LockUntil;
    }

    public Task ClearSignInAsync(
        string email,
        CancellationToken cancellationToken = default) =>
        _cache.RemoveAsync(SignInKey(email), cancellationToken);

    public async Task<bool> TryRecordForgotPasswordAsync(
        string email,
        DateTimeOffset now,
        CancellationToken cancellationToken = default)
    {
        var key = ForgotPasswordKey(email);
        var bucket = await GetAsync<ForgotPasswordBucket>(key, cancellationToken).ConfigureAwait(false)
            ?? new ForgotPasswordBucket([]);

        var recent = bucket.RequestedAt
            .Where(timestamp => now - timestamp <= TimeSpan.FromHours(1))
            .ToList();

        if (recent.Count >= 3)
        {
            await SetAsync(key, new ForgotPasswordBucket(recent), TimeSpan.FromHours(1), cancellationToken)
                .ConfigureAwait(false);
            return false;
        }

        recent.Add(now);
        await SetAsync(key, new ForgotPasswordBucket(recent), TimeSpan.FromHours(1), cancellationToken)
            .ConfigureAwait(false);
        return true;
    }

    private async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken)
    {
        var bytes = await _cache.GetAsync(key, cancellationToken).ConfigureAwait(false);
        return bytes is null ? default : JsonSerializer.Deserialize<T>(bytes, JsonOptions);
    }

    private Task SetAsync<T>(
        string key,
        T value,
        TimeSpan ttl,
        CancellationToken cancellationToken)
    {
        var bytes = JsonSerializer.SerializeToUtf8Bytes(value, JsonOptions);
        return _cache.SetAsync(
            key,
            bytes,
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = ttl },
            cancellationToken);
    }

    private static string SignInKey(string email) => $"auth:sign-in:{Hash(email)}";

    private static string ForgotPasswordKey(string email) => $"auth:forgot-password:{Hash(email)}";

    private static string Hash(string value)
    {
        var normalized = value.Trim().ToLowerInvariant();
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(normalized)));
    }

}
