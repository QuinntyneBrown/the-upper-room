using TheUpperRoom.Domain.Common;

namespace TheUpperRoom.Domain.Notifications;

public static class NotificationCatalog
{
    public static IReadOnlyCollection<NotificationType> All { get; } =
    [
        new("welcome", "Welcome to The Upper Room!", "We're glad you're here. Take a quick tour to get started.", NotificationSeverity.Info),
        new("email_verified", "Email verified", "Your email is confirmed. You can now invite others.", NotificationSeverity.Success),
        new("invite_sent", "Invitation sent", "You invited {email} to join {city}.", NotificationSeverity.Success),
        new("invite_accepted", "Invitation accepted", "{name} joined your city.", NotificationSeverity.Success),
        new("event_created", "Event created", "\"{title}\" was added to the calendar.", NotificationSeverity.Info),
        new("event_reminder_24h", "Event tomorrow", "\"{title}\" starts in 24 hours at {time}.", NotificationSeverity.Info),
        new("event_starting_soon", "Event starting soon", "\"{title}\" starts in 15 minutes.", NotificationSeverity.Warning),
        new("event_cancelled", "Event cancelled", "\"{title}\" has been cancelled.", NotificationSeverity.Warning),
        new("idea_voted", "Your idea got a vote", "{name} upvoted \"{title}\".", NotificationSeverity.Info),
        new("idea_status_changed", "Idea status changed", "\"{title}\" moved to {status}.", NotificationSeverity.Info),
        new("kanban_assigned", "New task assigned", "You were assigned \"{cardTitle}\" on {boardName}.", NotificationSeverity.Info),
        new("note_mention", "You were mentioned", "{name} mentioned you on {subject}.", NotificationSeverity.Info),
        new("password_changed", "Password changed", "Your password was updated. If this wasn't you, secure your account now.", NotificationSeverity.Warning),
        new("signin_new_device", "New sign-in", "Your account was signed into from {device} in {location}.", NotificationSeverity.Warning)
    ];

    public static NotificationType Require(string code) =>
        All.SingleOrDefault(type => type.Code == code)
        ?? throw new DomainException($"Notification type '{code}' is not registered.");
}
