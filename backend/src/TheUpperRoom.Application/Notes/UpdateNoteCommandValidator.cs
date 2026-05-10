using FluentValidation;

namespace TheUpperRoom.Application.Notes;

public sealed class UpdateNoteCommandValidator : AbstractValidator<UpdateNoteCommand>
{
    public UpdateNoteCommandValidator()
    {
        RuleFor(command => command.Id)
            .NotEmpty();

        When(command => command.Body is not null, () =>
        {
            RuleFor(command => command.Body!.BodyMarkdown)
                .NotEmpty();
        });
    }
}
