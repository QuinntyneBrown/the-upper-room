// traces_to: L2-050, L2-051
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Rbac;

namespace TheUpperRoom.Api.Uploads;

[ApiController]
[Authorize]
[Route("api/v1/uploads")]
public sealed class UploadsController : ControllerBase
{
    private const long MaxBoardBytes = 10L * 1024 * 1024;

    [HttpPost]
    public IActionResult Upload([FromForm] IFormFile? file)
    {
        var userId = User.FindFirst("sub")?.Value ?? "";
        if (string.IsNullOrEmpty(userId) || !SeedUsers.ById.ContainsKey(userId))
            return Unauthorized();

        if (file is null) return BadRequest(new { error = "No file provided." });
        if (file.Length > MaxBoardBytes)
            return UnprocessableEntity(new { error = "Image is too large (max 10MB). Try a smaller image." });

        var url = $"https://uploads.example.com/{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        return Ok(new { url });
    }
}
