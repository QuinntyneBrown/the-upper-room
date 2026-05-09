// traces_to: TASK-0220
namespace TheUpperRoom.Api.Auth;

public sealed class JwtSettings
{
    public string SigningKey { get; set; } = "";
    public string Issuer { get; set; } = "the-upper-room";
    public string Audience { get; set; } = "the-upper-room";
    public int AccessTokenLifetimeMinutes { get; set; } = 15;
}
