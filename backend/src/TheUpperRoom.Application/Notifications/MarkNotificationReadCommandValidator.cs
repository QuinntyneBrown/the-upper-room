using FluentValidation;

namespace TheUpperRoom.Application.Notifications;

public sealed class MarkNotificationReadCommandValidator : AbstractValidator<MarkNotificationReadCommand>
{
    public MarkNotificationReadCommandValidator()
    {
        RuleFor(command => command.Id).NotEmpty();
    }
}
