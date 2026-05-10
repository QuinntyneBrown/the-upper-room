using MediatR;

namespace TheUpperRoom.Application.Kanban;

public sealed record PatchCardCommand(string UserId, string CardId, Dictionary<string, object?>? Body)
    : IRequest<PatchCardResult>;
