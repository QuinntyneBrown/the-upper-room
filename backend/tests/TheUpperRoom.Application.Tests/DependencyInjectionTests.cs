using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Application.Auth;
using TheUpperRoom.Application.Common;
using TheUpperRoom.Application.Contacts;

namespace TheUpperRoom.Application.Tests;

public sealed class DependencyInjectionTests
{
    [Fact]
    public void AddApplication_registers_validators_from_application_assembly()
    {
        var services = new ServiceCollection().AddApplication();
        using var provider = services.BuildServiceProvider();

        // RegisterCommandValidator is in the Application assembly; it must
        // be discoverable as IValidator<RegisterCommand>.
        var validator = provider.GetService<IValidator<RegisterCommand>>();
        Assert.NotNull(validator);
        Assert.IsType<RegisterCommandValidator>(validator);
    }

    [Fact]
    public void AddApplication_registers_mediatr_pipeline_with_validation_behavior()
    {
        var services = new ServiceCollection().AddApplication();
        using var provider = services.BuildServiceProvider();

        // ValidationBehavior is registered for any IRequest<T>; mediatr
        // resolves it via IPipelineBehavior<,>.
        var behaviors = provider.GetServices<IPipelineBehavior<RegisterCommand, RegisterResult>>();
        Assert.Contains(behaviors, b => b is ValidationBehavior<RegisterCommand, RegisterResult>);
    }

    [Fact]
    public void AddApplication_registers_mediatr_so_send_can_be_invoked()
    {
        var services = new ServiceCollection().AddApplication();
        using var provider = services.BuildServiceProvider();

        var sender = provider.GetService<ISender>();
        Assert.NotNull(sender);
    }

    [Fact]
    public void AddApplication_with_extra_assembly_does_not_break_application_validators()
    {
        // Calling with an arbitrary extra assembly (Domain, here, just so
        // the test stays in-tree without adding Api as a dependency) must
        // not regress the Application-assembly registrations.
        var extraAssembly = typeof(TheUpperRoom.Domain.Common.Guard).Assembly;
        var services = new ServiceCollection().AddApplication(extraAssembly);
        using var provider = services.BuildServiceProvider();

        Assert.NotNull(provider.GetService<IValidator<CreateContactCommand>>());
        Assert.NotNull(provider.GetService<IValidator<RegisterCommand>>());
    }
}
