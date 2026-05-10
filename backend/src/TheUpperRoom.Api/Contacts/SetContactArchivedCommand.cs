using MediatR;

namespace TheUpperRoom.Api.Contacts;

public sealed record SetContactArchivedCommand(string UserId, string Id, bool Archived) : IRequest<MutateContactResult>;
