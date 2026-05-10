using FluentValidation;

namespace TheUpperRoom.Application.Kanban;

public sealed class PatchCardCommandValidator : AbstractValidator<PatchCardCommand>
{
    public PatchCardCommandValidator()
    {
        RuleFor(command => command.CardId).NotEmpty();
    }
}
