using MediatR;

namespace TheUpperRoom.Application.Contacts;

public sealed record SetContactArchivedCommand(string UserId, string Id, bool Archived) : IRequest<MutateContactResult>;
