using System.Reflection;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Application.Common;

namespace TheUpperRoom.Application;

public static class DependencyInjection
{
    /// <summary>
    /// Registers MediatR. Scans the Application assembly for IRequest types
    /// (the canonical home for command/query contracts) plus any additional
    /// assemblies that contain handlers. The Api project passes its own
    /// assembly so handlers co-located with controllers are picked up.
    /// </summary>
    public static IServiceCollection AddApplication(
        this IServiceCollection services,
        params Assembly[] additionalAssemblies)
    {
        var applicationAssembly = typeof(DependencyInjection).Assembly;
        services.AddValidatorsFromAssembly(applicationAssembly);
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(applicationAssembly);
            foreach (var assembly in additionalAssemblies)
            {
                cfg.RegisterServicesFromAssembly(assembly);
            }
        });

        foreach (var assembly in additionalAssemblies)
        {
            services.AddValidatorsFromAssembly(assembly);
        }

        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        return services;
    }
}
