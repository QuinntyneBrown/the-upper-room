// traces_to: L2-101
using System.Text.Json;

namespace TheUpperRoom.Application.Tests;

public sealed class CoverageGatesArchitectureTests
{
    [Fact]
    public void Coverlet_runsettings_file_exists_in_backend_root()
    {
        var root = FindRepoRoot();
        var runsettings = Path.Combine(root, "backend", "coverlet.runsettings");
        Assert.True(File.Exists(runsettings), "backend/coverlet.runsettings must exist with coverage thresholds");
    }

    [Theory]
    [InlineData("Domain", 90)]
    [InlineData("Application", 85)]
    [InlineData("Infrastructure", 70)]
    public void Coverlet_runsettings_enforces_threshold_for_project(string project, int minThreshold)
    {
        var root = FindRepoRoot();
        var runsettings = Path.Combine(root, "backend", "coverlet.runsettings");
        if (!File.Exists(runsettings))
            Assert.Fail("backend/coverlet.runsettings does not exist");

        var content = File.ReadAllText(runsettings);
        Assert.Contains(project, content, StringComparison.OrdinalIgnoreCase);

        // The threshold value in the file must be >= minThreshold
        var pattern = new System.Text.RegularExpressions.Regex(
            $@"{project}[^<]*<Threshold>(\d+)</Threshold>",
            System.Text.RegularExpressions.RegexOptions.IgnoreCase | System.Text.RegularExpressions.RegexOptions.Singleline);
        var match = pattern.Match(content);
        if (!match.Success)
        {
            // Try alternate format: look for threshold near the project name
            var altPattern = new System.Text.RegularExpressions.Regex(
                $@"<Include>.*{project}.*</Include>[\s\S]*?<Threshold>(\d+)</Threshold>",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            match = altPattern.Match(content);
        }
        Assert.True(match.Success, $"No threshold found for {project} in coverlet.runsettings");
        var threshold = int.Parse(match.Groups[1].Value);
        Assert.True(threshold >= minThreshold,
            $"{project} threshold {threshold} < required {minThreshold}");
    }

    [Fact]
    public void Frontend_vitest_config_exists()
    {
        var root = FindRepoRoot();
        var vitestConfig = Path.Combine(root, "frontend", "vitest.config.js");
        Assert.True(File.Exists(vitestConfig), "frontend/vitest.config.js must exist with coverage thresholds");
    }

    [Theory]
    [InlineData(80)]
    public void Frontend_vitest_config_enforces_coverage_thresholds(int minThreshold)
    {
        var root = FindRepoRoot();
        var vitestConfig = Path.Combine(root, "frontend", "vitest.config.js");
        if (!File.Exists(vitestConfig))
            Assert.Fail("frontend/vitest.config.js does not exist");

        var content = File.ReadAllText(vitestConfig);
        Assert.Contains("thresholds", content);
        Assert.Contains("branches", content);
        Assert.Contains("lines", content);

        var pattern = new System.Text.RegularExpressions.Regex(@"lines\s*:\s*(\d+)");
        var match = pattern.Match(content);
        Assert.True(match.Success, "vitest.config.js must set a 'lines' coverage threshold");
        var threshold = int.Parse(match.Groups[1].Value);
        Assert.True(threshold >= minThreshold,
            $"Frontend lines threshold {threshold} < required {minThreshold}");
    }

    private static string FindRepoRoot()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir != null && !Directory.Exists(Path.Combine(dir.FullName, ".git")))
            dir = dir.Parent;
        return dir?.FullName ?? AppContext.BaseDirectory;
    }
}
