using MediatR;
using Microsoft.AspNetCore.Http;

namespace TheUpperRoom.Api.Uploads;

public sealed record UploadFileCommand(string UserId, IFormFile? File) : IRequest<UploadFileResult>;
