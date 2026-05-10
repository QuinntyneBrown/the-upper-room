namespace TheUpperRoom.Application.Notifications;

public sealed record PushSubscribeRequest(string Endpoint, PushKeys? Keys);
