using MediatR;

namespace TheUpperRoom.Api.Kanban;

public sealed record MoveCardCommand(string UserId, string CardId, string? TargetColumnId)
    : IRequest<MoveCardResult>;
