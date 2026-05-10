using MediatR;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Application.Uploads;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Application.Tests;

// UploadFileHandler is internal sealed (per the Application architecture
// rules pinned in TechnologyGuidanceArchitectureTests), so we exercise it
// through MediatR's ISender just like callers do.
public sealed class UploadFileHandlerTests
{
    private const long MaxBytes = 10L * 1024 * 1024;

    private static ISender NewSender(bool userKnown = true)
    {
        var services = new ServiceCollection();
        services.AddSingleton<IUserDirectory>(new StubDirectory(userKnown));
        services.AddApplication();
        return services.BuildServiceProvider().GetRequiredService<ISender>();
    }

    [Fact]
    public async Task Returns_Unauthorized_when_user_directory_returns_null()
    {
        var sender = NewSender(userKnown: false);

        var result = await sender.Send(new UploadFileCommand("missing", 100, "a.jpg"));

        Assert.Equal(UploadFileOutcome.Unauthorized, result.Outcome);
        Assert.Null(result.Url);
    }

    [Fact]
    public async Task Returns_NoFile_when_length_or_filename_is_null()
    {
        var sender = NewSender();

        var noLength = await sender.Send(new UploadFileCommand("user-1", null, "a.jpg"));
        var noName = await sender.Send(new UploadFileCommand("user-1", 100, null));

        Assert.Equal(UploadFileOutcome.NoFile, noLength.Outcome);
        Assert.Equal(UploadFileOutcome.NoFile, noName.Outcome);
    }

    [Fact]
    public async Task Returns_TooLarge_when_length_exceeds_10_MB()
    {
        var sender = NewSender();

        var result = await sender.Send(new UploadFileCommand("user-1", MaxBytes + 1, "a.jpg"));

        Assert.Equal(UploadFileOutcome.TooLarge, result.Outcome);
        Assert.Contains("10MB", result.Error);
    }

    [Fact]
    public async Task Returns_Uploaded_with_url_carrying_extension_when_under_limit()
    {
        var sender = NewSender();

        var result = await sender.Send(new UploadFileCommand("user-1", 1024, "image.png"));

        Assert.Equal(UploadFileOutcome.Uploaded, result.Outcome);
        Assert.NotNull(result.Url);
        Assert.EndsWith(".png", result.Url);
        Assert.Null(result.Error);
    }

    [Fact]
    public async Task Boundary_at_max_bytes_is_accepted()
    {
        // Spec: "max 10MB" -> the handler uses `>` so the boundary itself is OK.
        var sender = NewSender();

        var result = await sender.Send(new UploadFileCommand("user-1", MaxBytes, "x.jpg"));

        Assert.Equal(UploadFileOutcome.Uploaded, result.Outcome);
    }

    private sealed class StubDirectory : IUserDirectory
    {
        private readonly bool _userKnown;
        public StubDirectory(bool userKnown) => _userKnown = userKnown;

        public AppUser? GetById(string id) =>
            _userKnown ? new AppUser(id, $"{id}@example.com", "city-1", "Member") : null;

        public IReadOnlyCollection<AppUser> All() => [];
    }
}
