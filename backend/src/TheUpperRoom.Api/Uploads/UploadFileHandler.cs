using MediatR;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Api.Uploads;

internal sealed class UploadFileHandler : IRequestHandler<UploadFileCommand, UploadFileResult>
{
    private const long MaxBoardBytes = 10L * 1024 * 1024;
    private readonly IUserDirectory _users;

    public UploadFileHandler(IUserDirectory users) => _users = users;

    public Task<UploadFileResult> Handle(UploadFileCommand request, CancellationToken cancellationToken)
    {
        if (_users.GetById(request.UserId) is null)
            return Task.FromResult(new UploadFileResult(null, UploadFileOutcome.Unauthorized, null));

        if (request.File is null)
            return Task.FromResult(new UploadFileResult(null, UploadFileOutcome.NoFile, "No file provided."));

        if (request.File.Length > MaxBoardBytes)
            return Task.FromResult(new UploadFileResult(
                null,
                UploadFileOutcome.TooLarge,
                "Image is too large (max 10MB). Try a smaller image."));

        var url = $"https://uploads.example.com/{Guid.NewGuid()}{Path.GetExtension(request.File.FileName)}";
        return Task.FromResult(new UploadFileResult(url, UploadFileOutcome.Uploaded, null));
    }
}
