using MediatR;

namespace TheUpperRoom.Application.Contacts;

public sealed record GetContactQuery(string UserId, string Id, string? Scope) : IRequest<GetContactResult>;
