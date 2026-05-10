using FluentValidation;

namespace TheUpperRoom.Application.Events;

public sealed class DenyRsvpCommandValidator : AbstractValidator<DenyRsvpCommand>
{
    public DenyRsvpCommandValidator()
    {
        RuleFor(command => command.EventId).NotEmpty();
        RuleFor(command => command.RsvpUserId).NotEmpty();
    }
}
