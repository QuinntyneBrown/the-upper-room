using FluentValidation;

namespace TheUpperRoom.Application.Contacts;

public sealed class CreateContactCommandValidator : AbstractValidator<CreateContactCommand>
{
    public CreateContactCommandValidator()
    {
        // Body == null is handled by the handler (returns BadRequest); only
        // validate field shape when the body is present.
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
