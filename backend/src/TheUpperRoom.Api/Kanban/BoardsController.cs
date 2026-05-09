// traces_to: L2-043, L2-044
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Rbac;

namespace TheUpperRoom.Api.Kanban;

[ApiController]
[Route("api/v1/boards")]
public sealed class BoardsController : ControllerBase
{
    private static readonly List<BoardListItem> Boards = new();

    internal static IReadOnlyList<(string BoardId, string BoardTitle, object[] Cards)> GetMyBoardGroups(string userId) =>
        Boards.Select(b => (b.Id, b.Name, Array.Empty<object>())).ToList();

    [HttpGet]
    public IActionResult List()
    {
        var user = CurrentUser();
        if (user is null) return Unauthorized();

        return Ok(new { items = Boards.ToArray(), total = Boards.Count });
    }

    [HttpGet("{id}")]
    public ActionResult<BoardDetailDto> GetById(string id)
    {
        var user = CurrentUser();
        if (user is null) return Unauthorized();

        var board = Boards.FirstOrDefault(b => b.Id == id);
        if (board is null) return NotFound();

        return Ok(new BoardDetailDto(
            Id: board.Id,
            Name: board.Name,
            Description: board.Description,
            Columns: Array.Empty<BoardColumnDto>(),
            Cards: Array.Empty<BoardCardDto>()));
    }

    [HttpPost]
    public ActionResult<BoardListItem> Create([FromBody] CreateBoardRequest? body)
    {
        var user = CurrentUser();
        if (user is null) return Unauthorized();
        if (body is null || string.IsNullOrWhiteSpace(body.Name))
        {
            return UnprocessableEntity(new { error = "Name is required." });
        }

        var board = new BoardListItem(
            Id: Guid.NewGuid().ToString("N")[..8],
            Name: body.Name.Trim(),
            Description: string.IsNullOrWhiteSpace(body.Description) ? null : body.Description.Trim(),
            ColumnCount: body.DefaultColumns ? 3 : 0,
            CardCount: 0,
            LastActivityAt: DateTimeOffset.UtcNow);

        Boards.Add(board);
        return Created($"/api/v1/boards/{board.Id}", board);
    }

    private SeedUser? CurrentUser()
    {
        var userId = Request.Headers["X-Test-User-Id"].ToString();
        return string.IsNullOrEmpty(userId) || !SeedUsers.ById.TryGetValue(userId, out var user)
            ? null
            : user;
    }
}
