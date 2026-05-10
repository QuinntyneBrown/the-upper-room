using MediatR;

namespace TheUpperRoom.Api.Contacts;

public sealed record UpdateContactCommand(string UserId, string Id, CreateContactRequest? Body) : IRequest<MutateContactResult>;
