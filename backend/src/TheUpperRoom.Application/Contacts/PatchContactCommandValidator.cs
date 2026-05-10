using FluentValidation;

namespace TheUpperRoom.Application.Contacts;

public sealed class PatchContactCommandValidator : AbstractValidator<PatchContactCommand>
{
    public PatchContactCommandValidator()
    {
        RuleFor(command => command.Id).NotEmpty();

        When(command => command.Body is not null, () =>
        {
            RuleFor(command => command.Body!.Name)
                .MaximumLength(200);
        });
    }
}
