using MediatR;

namespace TheUpperRoom.Api.Contacts;

public sealed record PatchContactCommand(string UserId, string Id, PatchContactRequest? Body) : IRequest<MutateContactResult>;
