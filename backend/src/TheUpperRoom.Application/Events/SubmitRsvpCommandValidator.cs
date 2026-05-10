using FluentValidation;

namespace TheUpperRoom.Application.Events;

public sealed class SubmitRsvpCommandValidator : AbstractValidator<SubmitRsvpCommand>
{
    private static readonly string[] AllowedStatuses = ["Going", "Maybe", "No"];

    public SubmitRsvpCommandValidator()
    {
        RuleFor(command => command.EventId)
            .NotEmpty();

        When(command => command.Body is not null, () =>
        {
            RuleFor(command => command.Body!.Status)
                .NotEmpty()
                .Must(status => AllowedStatuses.Contains(status))
                .WithMessage("Status must be one of: Going, Maybe, No.");
        });
    }
}
