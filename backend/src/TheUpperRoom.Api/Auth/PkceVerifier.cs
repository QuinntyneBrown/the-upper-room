// traces_to: L2-015
using System.Security.Cryptography;
using System.Text;

namespace TheUpperRoom.Api.Auth;

public interface IPkceVerifier
{
    bool Verify(string codeVerifier, string expectedChallenge);
}

public sealed class PkceVerifier : IPkceVerifier
{
    public bool Verify(string codeVerifier, string expectedChallenge)
    {
        var hash = SHA256.HashData(Encoding.ASCII.GetBytes(codeVerifier));
        var actualChallenge = Convert.ToBase64String(hash)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
        return CryptographicOperations.FixedTimeEquals(
            Encoding.ASCII.GetBytes(actualChallenge),
            Encoding.ASCII.GetBytes(expectedChallenge));
    }
}
