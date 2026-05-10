using FluentValidation;

namespace TheUpperRoom.Application.Events;

public sealed class CancelEventCommandValidator : AbstractValidator<CancelEventCommand>
{
    public CancelEventCommandValidator()
    {
        RuleFor(command => command.EventId).NotEmpty();

        RuleFor(command => command.Message)
            .MaximumLength(2000);
    }
}
