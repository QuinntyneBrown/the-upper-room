using FluentValidation;

namespace TheUpperRoom.Application.Notes;

public sealed class DeleteNoteCommandValidator : AbstractValidator<DeleteNoteCommand>
{
    public DeleteNoteCommandValidator()
    {
        RuleFor(command => command.Id).NotEmpty();
    }
}
