using MediatR;

namespace TheUpperRoom.Application.Contacts;

public sealed record DeleteContactCommand(string UserId, string Id) : IRequest<MutateContactResult>;
