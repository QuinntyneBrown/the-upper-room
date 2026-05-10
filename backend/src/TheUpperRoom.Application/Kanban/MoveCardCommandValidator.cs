using FluentValidation;

namespace TheUpperRoom.Application.Kanban;

public sealed class MoveCardCommandValidator : AbstractValidator<MoveCardCommand>
{
    public MoveCardCommandValidator()
    {
        RuleFor(command => command.CardId)
            .NotEmpty();

        RuleFor(command => command.TargetColumnId)
            .NotEmpty()
            .WithMessage("targetColumnId is required.");
    }
}
