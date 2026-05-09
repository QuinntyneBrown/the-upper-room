using FluentValidation;
using MediatR;
using TheUpperRoom.Application.Common;

namespace TheUpperRoom.Application.Tests;

public sealed class ValidationBehaviorTests
{
    [Fact]
    public async Task Handle_throws_validation_exception_when_request_is_invalid()
    {
        var behavior = new ValidationBehavior<TestCommand, string>([new TestCommandValidator()]);

        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            behavior.Handle(new TestCommand(""), () => Task.FromResult("ok"), CancellationToken.None));

        Assert.Contains(exception.Errors, error => error.PropertyName == nameof(TestCommand.Name));
    }

    [Fact]
    public async Task Handle_calls_next_when_request_is_valid()
    {
        var behavior = new ValidationBehavior<TestCommand, string>([new TestCommandValidator()]);

        var result = await behavior.Handle(
            new TestCommand("valid"),
            () => Task.FromResult("ok"),
            CancellationToken.None);

        Assert.Equal("ok", result);
    }

    private sealed record TestCommand(string Name) : IRequest<string>;

    private sealed class TestCommandValidator : AbstractValidator<TestCommand>
    {
        public TestCommandValidator()
        {
            RuleFor(command => command.Name).NotEmpty();
        }
    }
}
