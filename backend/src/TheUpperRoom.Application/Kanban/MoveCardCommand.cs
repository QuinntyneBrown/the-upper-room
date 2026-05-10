using MediatR;

namespace TheUpperRoom.Application.Kanban;

public sealed record MoveCardCommand(string UserId, string CardId, string? TargetColumnId)
    : IRequest<MoveCardResult>;
