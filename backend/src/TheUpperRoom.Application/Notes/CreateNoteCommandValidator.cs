using FluentValidation;

namespace TheUpperRoom.Application.Notes;

public sealed class CreateNoteCommandValidator : AbstractValidator<CreateNoteCommand>
{
    public CreateNoteCommandValidator()
    {
        // Body == null is handled by the handler (returns BadRequest); only
        // validate field shape when the body is present. SubjectType is
        // validated dynamically by the handler against the NoteSubjectType
        // enum, so no enum check here.
        When(command => command.Body is not null, () =>
        {
            RuleFor(command => command.Body!.SubjectType)
                .NotEmpty()
                .MaximumLength(50);

            RuleFor(command => command.Body!.SubjectId)
                .NotEmpty()
                .MaximumLength(100);

            RuleFor(command => command.Body!.BodyMarkdown)
                .NotEmpty();
        });
    }
}
