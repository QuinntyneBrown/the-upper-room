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

    [Fact]
    public async Task Handle_with_no_validators_calls_next_directly()
    {
        var behavior = new ValidationBehavior<TestCommand, string>([]);
        var nextCalled = false;

        var result = await behavior.Handle(
            new TestCommand(""),
            () => { nextCalled = true; return Task.FromResult("ok"); },
            CancellationToken.None);

        Assert.True(nextCalled);
        Assert.Equal("ok", result);
    }

    [Fact]
    public async Task Handle_does_not_call_next_when_validation_fails()
    {
        var behavior = new ValidationBehavior<TestCommand, string>([new TestCommandValidator()]);
        var nextCalled = false;

        await Assert.ThrowsAsync<ValidationException>(() => behavior.Handle(
            new TestCommand(""),
            () => { nextCalled = true; return Task.FromResult("ok"); },
            CancellationToken.None));

        Assert.False(nextCalled);
    }

    [Fact]
    public async Task Handle_aggregates_failures_from_multiple_validators()
    {
        var behavior = new ValidationBehavior<TestCommand, string>(
            [new TestCommandValidator(), new TestCommandValidator()]);

        var exception = await Assert.ThrowsAsync<ValidationException>(() => behavior.Handle(
            new TestCommand(""),
            () => Task.FromResult("ok"),
            CancellationToken.None));

        // Two validators each emit one or more errors for the empty Name;
        // assert "more than one validator's worth" rather than an exact
        // count to stay robust to FluentValidation's internal NotEmpty
        // behaviour.
        Assert.True(exception.Errors.Count(e => e.PropertyName == nameof(TestCommand.Name)) >= 2);
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
