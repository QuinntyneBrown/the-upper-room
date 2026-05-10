using FluentValidation;

namespace TheUpperRoom.Application.Auth;

public sealed class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(command => command.UserId)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(command => command.CurrentPassword)
            .NotEmpty()
            .MaximumLength(128);

        RuleFor(command => command.NewPassword)
            .NotEmpty()
            .MinimumLength(12)
            .MaximumLength(128);
    }
}
