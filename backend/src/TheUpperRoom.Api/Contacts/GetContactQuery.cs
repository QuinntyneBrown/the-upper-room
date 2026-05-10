using MediatR;

namespace TheUpperRoom.Api.Contacts;

public sealed record GetContactQuery(string UserId, string Id, string? Scope) : IRequest<GetContactResult>;
