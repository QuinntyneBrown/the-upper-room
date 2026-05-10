using FluentValidation;

namespace TheUpperRoom.Application.Auth;

public sealed class DeleteAccountCommandValidator : AbstractValidator<DeleteAccountCommand>
{
    public DeleteAccountCommandValidator()
    {
        RuleFor(command => command.UserId)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(command => command.CurrentPassword)
            .NotEmpty()
            .MaximumLength(128);
    }
}
