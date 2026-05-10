using MediatR;

namespace TheUpperRoom.Api.Notifications;

public sealed record GetVapidPublicKeyQuery() : IRequest<string>;
