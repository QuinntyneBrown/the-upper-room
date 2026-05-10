using FluentValidation;

namespace TheUpperRoom.Application.Contacts;

public sealed class SetContactArchivedCommandValidator : AbstractValidator<SetContactArchivedCommand>
{
    public SetContactArchivedCommandValidator()
    {
        RuleFor(command => command.Id).NotEmpty();
    }
}
