using MediatR;

namespace TheUpperRoom.Application.Contacts;

public sealed record PatchContactCommand(string UserId, string Id, PatchContactRequest? Body) : IRequest<MutateContactResult>;
