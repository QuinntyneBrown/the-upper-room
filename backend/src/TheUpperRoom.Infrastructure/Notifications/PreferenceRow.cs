namespace TheUpperRoom.Infrastructure.Notifications;

public sealed class PreferenceRow
{
    public string UserId { get; set; } = "";
    public string Code { get; set; } = "";
    public bool InApp { get; set; } = true;
    public bool Email { get; set; } = true;
    public bool Push { get; set; }
}
