// traces_to: L2-050, L2-051
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Auth;
using TheUpperRoom.Application.Uploads;

namespace TheUpperRoom.Api.Uploads;

[ApiController]
[Authorize]
[Route("api/v1/uploads")]
public sealed class UploadsController(IMediator mediator, ICurrentUser currentUser) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Upload([FromForm] IFormFile? file, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new UploadFileCommand(currentUser.UserId ?? "", file?.Length, file?.FileName),
            cancellationToken);

        return result.Outcome switch
        {
            UploadFileOutcome.Unauthorized => Unauthorized(),
            UploadFileOutcome.NoFile => BadRequest(new { error = result.Error }),
            UploadFileOutcome.TooLarge => UnprocessableEntity(new { error = result.Error }),
            UploadFileOutcome.Uploaded => Ok(new { url = result.Url }),
            _ => StatusCode(500),
        };
    }
}
