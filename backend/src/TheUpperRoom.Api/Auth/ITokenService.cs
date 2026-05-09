// traces_to: TASK-0220
namespace TheUpperRoom.Api.Auth;

public interface ITokenService
{
    string IssueAccessToken(string subject);
    string IssueRefreshToken();
}
