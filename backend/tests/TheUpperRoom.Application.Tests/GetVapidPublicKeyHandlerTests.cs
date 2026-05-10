using MediatR;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Application.Notifications;

namespace TheUpperRoom.Application.Tests;

// Handler is internal sealed; exercised via MediatR ISender like callers do.
public sealed class GetVapidPublicKeyHandlerTests
{
    private static ISender NewSender(PushSettings settings)
    {
        var services = new ServiceCollection();
        services.AddSingleton(settings);
        services.AddApplication();
        return services.BuildServiceProvider().GetRequiredService<ISender>();
    }

    [Fact]
    public async Task Returns_configured_public_key()
    {
        var sender = NewSender(new PushSettings { VapidPublicKey = "BPublicKey-abc-123" });

        var key = await sender.Send(new GetVapidPublicKeyQuery());

        Assert.Equal("BPublicKey-abc-123", key);
    }

    [Fact]
    public async Task Returns_empty_string_when_settings_value_is_empty()
    {
        var sender = NewSender(new PushSettings { VapidPublicKey = "" });

        var key = await sender.Send(new GetVapidPublicKeyQuery());

        Assert.Equal("", key);
    }
}
