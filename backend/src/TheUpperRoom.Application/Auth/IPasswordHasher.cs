namespace TheUpperRoom.Application.Auth;

public interface IPasswordHasher
{
    string Hash(string plain);

    PasswordHashVerificationResult Verify(string plain, string hash);
}
