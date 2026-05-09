// Traces to: TASK-0234
namespace TheUpperRoom.Api.Tests.Cleanup;

public sealed class SeedDataRemovedTests
{
    [Fact]
    public void Production_source_does_not_define_SeedUser_or_SeedUsers_symbols()
    {
        var srcRoot = LocateSrcRoot();
        var matches = Directory
            .EnumerateFiles(srcRoot, "*.cs", SearchOption.AllDirectories)
            .Where(p => !p.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}")
                        && !p.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}"))
            .Where(p =>
            {
                var c = File.ReadAllText(p);
                return c.Contains("class SeedUsers")
                       || c.Contains("record SeedUser")
                       || c.Contains("SeedUsers.ById");
            })
            .ToList();
        Assert.Empty(matches);
    }

    [Fact]
    public void Production_source_has_no_example_com_email_addresses()
    {
        var srcRoot = LocateSrcRoot();
        var matches = Directory
            .EnumerateFiles(srcRoot, "*.cs", SearchOption.AllDirectories)
            .Where(p => !p.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}")
                        && !p.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}"))
            .Where(p => File.ReadAllText(p).Contains("@example.com"))
            .ToList();
        Assert.Empty(matches);
    }

    [Fact]
    public void Production_source_does_not_seed_e_seed_event()
    {
        var srcRoot = LocateSrcRoot();
        var matches = Directory
            .EnumerateFiles(srcRoot, "*.cs", SearchOption.AllDirectories)
            .Where(p => !p.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}")
                        && !p.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}"))
            .Where(p =>
            {
                var c = File.ReadAllText(p);
                return c.Contains("\"e-seed\"") || c.Contains("City Prayer Night");
            })
            .ToList();
        Assert.Empty(matches);
    }

    private static string LocateSrcRoot()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null && !File.Exists(Path.Combine(dir.FullName, "TheUpperRoom.sln")))
            dir = dir.Parent;
        Assert.NotNull(dir);
        return Path.Combine(dir!.FullName, "src");
    }
}
