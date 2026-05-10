using FluentValidation;

namespace TheUpperRoom.Application.Kanban;

public sealed class DeleteCardCommandValidator : AbstractValidator<DeleteCardCommand>
{
    public DeleteCardCommandValidator()
    {
        RuleFor(command => command.CardId).NotEmpty();
    }
}
