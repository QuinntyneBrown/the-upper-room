using MediatR;

namespace TheUpperRoom.Application.Contacts;

public sealed record UpdateContactCommand(string UserId, string Id, CreateContactRequest? Body) : IRequest<MutateContactResult>;
