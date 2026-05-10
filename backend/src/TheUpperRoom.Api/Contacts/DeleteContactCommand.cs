using MediatR;

namespace TheUpperRoom.Api.Contacts;

public sealed record DeleteContactCommand(string UserId, string Id) : IRequest<MutateContactResult>;
