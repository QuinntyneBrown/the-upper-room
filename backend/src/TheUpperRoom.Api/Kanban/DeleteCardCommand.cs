using MediatR;

namespace TheUpperRoom.Api.Kanban;

public sealed record DeleteCardCommand(string UserId, string CardId)
    : IRequest<DeleteCardResult>;
