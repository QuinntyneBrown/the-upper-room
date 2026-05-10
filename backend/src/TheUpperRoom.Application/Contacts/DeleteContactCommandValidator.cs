using FluentValidation;

namespace TheUpperRoom.Application.Contacts;

public sealed class DeleteContactCommandValidator : AbstractValidator<DeleteContactCommand>
{
    public DeleteContactCommandValidator()
    {
        RuleFor(command => command.Id).NotEmpty();
    }
}
