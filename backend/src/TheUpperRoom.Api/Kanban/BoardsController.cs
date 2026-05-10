// traces_to: L2-043, L2-044
// Traces to: TASK-0228
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Auth;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Api.Kanban;

[ApiController]
[Authorize]
[Route("api/v1/boards")]
public sealed class BoardsController(
    KanbanDbContext db,
    ICurrentUser currentUser,
    IUserDirectory userDirectory) : ControllerBase
{
    internal static IReadOnlyList<(string BoardId, string BoardTitle, object[] Cards)> GetMyBoardGroups(string userId, KanbanDbContext db) =>
        db.Boards.Select(b => new { b.Id, b.Name }).AsEnumerable()
                 .Select(b => (b.Id, b.Name, Array.Empty<object>()))
                 .ToList();

    [HttpGet]
    public IActionResult List()
    {
        var user = CurrentUser();
        if (user is null) return Unauthorized();

        var boards = db.Boards.AsEnumerable().Select(b =>
        {
            var colCount = db.Columns.Count(c => c.BoardId == b.Id);
            var cardCount = db.Cards.Count(c => c.BoardId == b.Id);
            return new BoardListItem(b.Id, b.Name, b.Description, colCount, cardCount, b.LastActivityAt);
        }).ToArray();

        return Ok(new { items = boards, total = boards.Length });
    }

    [HttpGet("{id}")]
    public ActionResult<BoardDetailDto> GetById(string id)
    {
        var user = CurrentUser();
        if (user is null) return Unauthorized();

        var board = db.Boards.Find(id);
        if (board is null) return NotFound();

        var columns = db.Columns.Where(c => c.BoardId == id).OrderBy(c => c.ColumnOrder)
            .Select(c => new BoardColumnDto(c.Id, c.Name, c.Color, c.WipLimit)).ToArray();

        var swimlaneMode = board.SwimlaneMode;
        var cards = db.Cards.Where(c => c.BoardId == id).OrderBy(c => c.CardOrder)
            .AsEnumerable()
            .Select(c => new BoardCardDto(c.Id, c.ColumnId, c.Title, Array.Empty<BoardCardTagDto>(), c.AssigneeName, c.DueDate,
                swimlaneMode == "Assignee" ? (c.AssigneeName ?? "") : null, c.Archived))
            .ToArray();

        return Ok(new BoardDetailDto(board.Id, board.Name, board.Description, columns, cards, board.SwimlaneMode));
    }

    [HttpPost]
    public ActionResult<BoardListItem> Create([FromBody] CreateBoardRequest? body)
    {
        var user = CurrentUser();
        if (user is null) return Unauthorized();
        if (body is null || string.IsNullOrWhiteSpace(body.Name))
            return UnprocessableEntity(new { error = "Name is required." });

        var boardId = Guid.NewGuid().ToString("N")[..8];
        var board = new BoardRow
        {
            Id = boardId,
            Name = body.Name.Trim(),
            Description = string.IsNullOrWhiteSpace(body.Description) ? null : body.Description.Trim(),
            LastActivityAt = DateTimeOffset.UtcNow,
        };
        db.Boards.Add(board);

        if (body.DefaultColumns)
        {
            var defaultCols = new[] { ("To Do", "blue"), ("In Progress", "amber"), ("Done", "green") };
            for (var i = 0; i < defaultCols.Length; i++)
            {
                db.Columns.Add(new BoardColumnRow
                {
                    Id = Guid.NewGuid().ToString("N")[..8],
                    BoardId = boardId,
                    Name = defaultCols[i].Item1,
                    Color = defaultCols[i].Item2,
                    ColumnOrder = i,
                });
            }
        }

        db.SaveChanges();
        return Created($"/api/v1/boards/{board.Id}", new BoardListItem(board.Id, board.Name, board.Description, body.DefaultColumns ? 3 : 0, 0, board.LastActivityAt));
    }

    [HttpPatch("{id}")]
    public IActionResult Patch(string id, [FromBody] PatchBoardRequest? body)
    {
        var user = CurrentUser();
        if (user is null) return Unauthorized();

        var board = db.Boards.Find(id);
        if (board is null) return NotFound();
        if (body is null) return BadRequest();

        if (body.SwimlaneMode is not null) board.SwimlaneMode = body.SwimlaneMode;
        if (body.Name is not null) board.Name = body.Name;
        db.SaveChanges();
        return Ok(board);
    }

    [HttpPost("{id}/cards")]
    public IActionResult CreateCard(string id, [FromBody] CreateCardRequest? body)
    {
        var user = CurrentUser();
        if (user is null) return Unauthorized();

        var board = db.Boards.Find(id);
        if (board is null) return NotFound();
        if (body is null || string.IsNullOrWhiteSpace(body.Title)) return BadRequest();

        var maxOrder = db.Cards.Where(c => c.BoardId == id).Select(c => (int?)c.CardOrder).Max() ?? -1;
        var card = new CardRow
        {
            Id = Guid.NewGuid().ToString("N")[..8],
            BoardId = id,
            ColumnId = body.ColumnId,
            Title = body.Title.Trim(),
            CardOrder = maxOrder + 1,
        };
        db.Cards.Add(card);
        board.LastActivityAt = DateTimeOffset.UtcNow;
        db.SaveChanges();
        return Created($"/api/v1/boards/{id}/cards/{card.Id}", new { card.Id, card.ColumnId, card.Title });
    }

    [HttpPost("{id}/columns/order")]
    public IActionResult ReorderColumns(string id, [FromBody] ColumnOrderRequest? body)
    {
        var user = CurrentUser();
        if (user is null) return Unauthorized();
        if (body is null) return BadRequest();

        var columns = db.Columns.Where(c => c.BoardId == id).ToList();
        for (var i = 0; i < body.Order.Length; i++)
        {
            var col = columns.FirstOrDefault(c => c.Id == body.Order[i]);
            if (col is not null) col.ColumnOrder = i;
        }
        db.SaveChanges();
        return Ok();
    }

    [HttpPatch("{id}/columns/{columnId}")]
    public IActionResult PatchColumn(string id, string columnId, [FromBody] PatchColumnRequest? body)
    {
        var user = CurrentUser();
        if (user is null) return Unauthorized();

        var col = db.Columns.FirstOrDefault(c => c.BoardId == id && c.Id == columnId);
        if (col is null) return NotFound();
        if (body is null) return BadRequest();

        if (body.WipLimit.HasValue) col.WipLimit = body.WipLimit == 0 ? null : body.WipLimit;
        if (body.Name is not null) col.Name = body.Name;
        if (body.Color is not null) col.Color = body.Color;
        db.SaveChanges();
        return Ok(new BoardColumnDto(col.Id, col.Name, col.Color, col.WipLimit));
    }

    [HttpDelete("{id}/columns/{columnId}")]
    public IActionResult DeleteColumn(string id, string columnId, [FromBody] DeleteColumnRequest? body)
    {
        var user = CurrentUser();
        if (user is null) return Unauthorized();

        var col = db.Columns.FirstOrDefault(c => c.BoardId == id && c.Id == columnId);
        if (col is null) return NotFound();

        if (body?.TargetColumnId is not null)
        {
            var cardsToMove = db.Cards.Where(c => c.BoardId == id && c.ColumnId == columnId).ToList();
            foreach (var card in cardsToMove) card.ColumnId = body.TargetColumnId;
        }
        else
        {
            db.Cards.RemoveRange(db.Cards.Where(c => c.BoardId == id && c.ColumnId == columnId));
        }

        db.Columns.Remove(col);
        db.SaveChanges();
        return NoContent();
    }

    private AppUser? CurrentUser() =>
        userDirectory.GetById(currentUser.UserId ?? "");
}

public sealed record PatchBoardRequest(string? Name, string? SwimlaneMode);
public sealed record CreateCardRequest(string Title, string ColumnId);
public sealed record ColumnOrderRequest(string[] Order);
public sealed record PatchColumnRequest(int? WipLimit, string? Name, string? Color);
public sealed record DeleteColumnRequest(string? TargetColumnId);
