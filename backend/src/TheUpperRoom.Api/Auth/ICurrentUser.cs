// traces_to: TASK-0221
namespace TheUpperRoom.Api.Auth;

public interface ICurrentUser
{
    string? UserId { get; }
}
