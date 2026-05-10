using MediatR;

namespace TheUpperRoom.Api.Contacts;

public sealed record CreateContactCommand(string UserId, CreateContactRequest? Body) : IRequest<MutateContactResult>;
