using MediatR;

namespace TheUpperRoom.Application.Kanban;

public sealed record DeleteCardCommand(string UserId, string CardId)
    : IRequest<DeleteCardResult>;
