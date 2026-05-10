namespace TheUpperRoom.Application.Notifications;

internal static class NotificationMapping
{
    public static NotificationDto ToDto(NotificationRow n) =>
        new(n.Id, n.Code, n.Title, n.Body, n.Data, n.Read, n.CreatedAt, n.DeepLink, n.Severity);

    public static string Render(string template, Dictionary<string, string> data) =>
        data.Aggregate(template, (t, kv) => t.Replace("{" + kv.Key + "}", kv.Value));
}
