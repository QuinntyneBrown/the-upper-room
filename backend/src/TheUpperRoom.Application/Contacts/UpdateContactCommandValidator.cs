using FluentValidation;

namespace TheUpperRoom.Application.Contacts;

public sealed class UpdateContactCommandValidator : AbstractValidator<UpdateContactCommand>
{
    public UpdateContactCommandValidator()
    {
        RuleFor(command => command.Id)
            .NotEmpty();

        When(command => command.Body is not null, () =>
        {
            RuleFor(command => command.Body!.FirstName)
                .NotEmpty()
                .MaximumLength(100);

            RuleFor(command => command.Body!.LastName)
                .MaximumLength(100);

            RuleFor(command => command.Body!.DisplayName)
                .MaximumLength(200);
        });
    }
}
