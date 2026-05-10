using FluentValidation;

namespace TheUpperRoom.Application.Notifications;

public sealed class UpsertNotificationPreferenceCommandValidator : AbstractValidator<UpsertNotificationPreferenceCommand>
{
    public UpsertNotificationPreferenceCommandValidator()
    {
        When(command => command.Body is not null, () =>
        {
            RuleFor(command => command.Body!.Code)
                .NotEmpty()
                .MaximumLength(100);
        });
    }
}
