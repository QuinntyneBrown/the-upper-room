// traces_to: L2-041, L2-093
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Auth;

namespace TheUpperRoom.Api.Notes;

[ApiController]
[Authorize]
[Route("api/v1/notes")]
public sealed class NotesController(IMediator mediator, ICurrentUser currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? subjectType, [FromQuery] string? subjectId, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new ListNotesQuery(currentUser.UserId ?? "", subjectType, subjectId), cancellationToken);
        return result.Outcome switch
        {
            NotesOutcome.Unauthorized => Unauthorized(),
            NotesOutcome.BadRequest => BadRequest(new { error = result.Error }),
            NotesOutcome.Ok => Ok(new { items = result.Items, total = result.Items.Length }),
            _ => StatusCode(500),
        };
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<NoteDto>> GetById(string id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetNoteQuery(currentUser.UserId ?? "", id), cancellationToken);
        return Map(result);
    }

    [HttpPost]
    public async Task<ActionResult<NoteDto>> Create([FromBody] CreateNoteRequest? body, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new CreateNoteCommand(currentUser.UserId ?? "", body), cancellationToken);
        return result.Outcome == NotesOutcome.Created
            ? Created($"/api/v1/notes/{result.Note!.Id}", result.Note)
            : Map(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<NoteDto>> Update(string id, [FromBody] UpdateNoteRequest? body, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new UpdateNoteCommand(currentUser.UserId ?? "", id, body), cancellationToken);
        return Map(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new DeleteNoteCommand(currentUser.UserId ?? "", id), cancellationToken);
        return result.Outcome switch
        {
            NotesOutcome.Unauthorized => Unauthorized(),
            NotesOutcome.NotFound => NotFound(),
            NotesOutcome.NoContent => NoContent(),
            _ => StatusCode(500),
        };
    }

    private ActionResult<NoteDto> Map(NoteResult result) => result.Outcome switch
    {
        NotesOutcome.Unauthorized => Unauthorized(),
        NotesOutcome.NotFound => NotFound(),
        NotesOutcome.BadRequest => BadRequest(new { error = result.Error }),
        NotesOutcome.Unprocessable => UnprocessableEntity(new { error = result.Error }),
        NotesOutcome.Ok => Ok(result.Note),
        NotesOutcome.Created => Created(string.Empty, result.Note),
        _ => StatusCode(500),
    };
}
