using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace TheUpperRoom.Infrastructure.Seeding;

/// <summary>
/// Runs ISeedingService once at host startup, but only when the host is in
/// the Development environment. In Production this hosted service is a no-op.
/// </summary>
internal sealed class SeedingHostedService : IHostedService
{
    private readonly IServiceProvider _services;
    private readonly IHostEnvironment _environment;
    private readonly ILogger<SeedingHostedService> _logger;

    public SeedingHostedService(
        IServiceProvider services,
        IHostEnvironment environment,
        ILogger<SeedingHostedService> logger)
    {
        _services = services;
        _environment = environment;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        if (!_environment.IsDevelopment())
        {
            _logger.LogInformation(
                "Skipping seed: environment is {Environment}.",
                _environment.EnvironmentName);
            return;
        }

        await using var scope = _services.CreateAsyncScope();
        var service = scope.ServiceProvider.GetRequiredService<ISeedingService>();
        await service.SeedAsync(cancellationToken).ConfigureAwait(false);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
