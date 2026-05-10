using FluentValidation;

namespace TheUpperRoom.Application.Notifications;

public sealed class SubscribePushCommandValidator : AbstractValidator<SubscribePushCommand>
{
    public SubscribePushCommandValidator()
    {
        When(command => command.Body is not null, () =>
        {
            RuleFor(command => command.Body!.Endpoint)
                .NotEmpty()
                .MaximumLength(2048);
        });
    }
}
