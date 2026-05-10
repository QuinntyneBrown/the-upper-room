using TheUpperRoom.Application.Auth;
using IdentityPasswordHasher = Microsoft.AspNetCore.Identity.PasswordHasher<object>;
using IdentityPasswordVerificationResult = Microsoft.AspNetCore.Identity.PasswordVerificationResult;

namespace TheUpperRoom.Infrastructure.Auth;

public sealed class PasswordHasher : IPasswordHasher
{
    private static readonly object PasswordOwner = new();
    private readonly IdentityPasswordHasher _inner = new();

    public string Hash(string plain)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(plain);
        return _inner.HashPassword(PasswordOwner, plain);
    }

    public PasswordHashVerificationResult Verify(string plain, string hash)
    {
        if (string.IsNullOrWhiteSpace(plain) || string.IsNullOrWhiteSpace(hash))
        {
            return PasswordHashVerificationResult.Failed;
        }

        return _inner.VerifyHashedPassword(PasswordOwner, hash, plain) switch
        {
            IdentityPasswordVerificationResult.Success => PasswordHashVerificationResult.Success,
            IdentityPasswordVerificationResult.SuccessRehashNeeded => PasswordHashVerificationResult.Rehash,
            _ => PasswordHashVerificationResult.Failed,
        };
    }
}
