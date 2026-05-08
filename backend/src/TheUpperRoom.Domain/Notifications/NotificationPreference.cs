using TheUpperRoom.Domain.Common;

namespace TheUpperRoom.Domain.Notifications;

public sealed class NotificationPreference : Entity
{
    public NotificationPreference(string userId, string code, bool inApp, bool email, bool push, string? id = null) : base(id)
    {
        UserId = Guard.Id(userId, nameof(UserId));
        Code = Guard.Required(code, nameof(Code), 100);
        InApp = inApp;
        Email = email;
        Push = push;
    }

    public string UserId { get; }

    public string Code { get; }

    public bool InApp { get; private set; }

    public bool Email { get; private set; }

    public bool Push { get; private set; }

    public void Update(bool inApp, bool email, bool push)
    {
        InApp = inApp;
        Email = email;
        Push = push;
    }
}
