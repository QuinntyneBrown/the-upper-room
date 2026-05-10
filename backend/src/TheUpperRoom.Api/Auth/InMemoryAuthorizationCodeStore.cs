using System.Collections.Concurrent;
using System.Security.Cryptography;

namespace TheUpperRoom.Api.Auth;

/// <summary>
/// Single-process in-memory authorization-code store. Suitable for local
/// development and the test harness; not for production. Codes expire after
/// 5 minutes.
/// </summary>
internal sealed class InMemoryAuthorizationCodeStore : IAuthorizationCodeStore
{
    private static readonly TimeSpan _ttl = TimeSpan.FromMinutes(5);
    private readonly ConcurrentDictionary<string, AuthorizationCodeRecord> _codes = new();

    public string Issue(string userId, string codeChallenge)
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        var code = Convert.ToBase64String(bytes)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
        _codes[code] = new AuthorizationCodeRecord(userId, codeChallenge, DateTimeOffset.UtcNow);
        return code;
    }

    public AuthorizationCodeRecord? Consume(string code)
    {
        if (string.IsNullOrEmpty(code)) return null;
        if (!_codes.TryRemove(code, out var record)) return null;
        if (DateTimeOffset.UtcNow - record.IssuedAt > _ttl) return null;
        return record;
    }
}
