using FluentValidation;

namespace TheUpperRoom.Application.Notifications;

public sealed class DispatchNotificationCommandValidator : AbstractValidator<DispatchNotificationCommand>
{
    public DispatchNotificationCommandValidator()
    {
        When(command => command.Body is not null, () =>
        {
            RuleFor(command => command.Body!.Code)
                .NotEmpty()
                .MaximumLength(100);

            RuleFor(command => command.Body!.RecipientIds)
                .NotEmpty()
                .WithMessage("At least one recipient is required.");
        });
    }
}
