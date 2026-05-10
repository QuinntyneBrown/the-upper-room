using MediatR;

namespace TheUpperRoom.Application.Contacts;

public sealed record CreateContactCommand(string UserId, CreateContactRequest? Body) : IRequest<MutateContactResult>;
