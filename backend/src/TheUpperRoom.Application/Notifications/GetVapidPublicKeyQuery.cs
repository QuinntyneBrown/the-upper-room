using MediatR;

namespace TheUpperRoom.Application.Notifications;

public sealed record GetVapidPublicKeyQuery() : IRequest<string>;
