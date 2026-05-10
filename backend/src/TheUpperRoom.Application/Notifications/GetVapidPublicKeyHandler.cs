using MediatR;

namespace TheUpperRoom.Application.Notifications;

internal sealed class GetVapidPublicKeyHandler : IRequestHandler<GetVapidPublicKeyQuery, string>
{
    private readonly PushSettings _settings;
    public GetVapidPublicKeyHandler(PushSettings settings) => _settings = settings;
    public Task<string> Handle(GetVapidPublicKeyQuery request, CancellationToken cancellationToken) =>
        Task.FromResult(_settings.VapidPublicKey ?? "");
}
