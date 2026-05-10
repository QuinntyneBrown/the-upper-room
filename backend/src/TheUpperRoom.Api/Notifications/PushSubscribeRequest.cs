namespace TheUpperRoom.Api.Notifications;

public sealed record PushSubscribeRequest(string Endpoint, PushKeys? Keys);
