using MediatR;

namespace TheUpperRoom.Application.Uploads;

public sealed record UploadFileCommand(string UserId, long? Length, string? FileName) : IRequest<UploadFileResult>;
