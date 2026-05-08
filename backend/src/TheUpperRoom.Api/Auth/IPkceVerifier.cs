// traces_to: L2-015
namespace TheUpperRoom.Api.Auth;

public interface IPkceVerifier
{
    bool Verify(string codeVerifier, string expectedChallenge);
}
