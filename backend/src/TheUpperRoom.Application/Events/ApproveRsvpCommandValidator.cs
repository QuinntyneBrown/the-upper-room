using FluentValidation;

namespace TheUpperRoom.Application.Events;

public sealed class ApproveRsvpCommandValidator : AbstractValidator<ApproveRsvpCommand>
{
    public ApproveRsvpCommandValidator()
    {
        RuleFor(command => command.EventId).NotEmpty();
        RuleFor(command => command.RsvpUserId).NotEmpty();
    }
}
