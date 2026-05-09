// traces_to: L2-095
using System.Text.RegularExpressions;

namespace TheUpperRoom.Application.Tests;

public sealed class SecretsArchitectureTests
{
    private static readonly string[] _secretPatterns = ["Secret", "Password", "Key", "ConnectionString", "ApiKey"];
    private static readonly Regex _placeholderPattern = new(@"\$\{[^}]+\}|\$\([^)]+\)|<[^>]+>", RegexOptions.Compiled);

    [Fact]
    public void AppSettings_files_do_not_contain_literal_secret_values()
    {
        var root = FindRepoRoot();
        var appsettingsFiles = Directory.GetFiles(root, "appsettings*.json", SearchOption.AllDirectories)
            .Where(f => !f.Contains("bin") && !f.Contains("obj"))
            .ToList();

        foreach (var file in appsettingsFiles)
        {
            var content = File.ReadAllText(file);
            foreach (var pattern in _secretPatterns)
            {
                var regex = new Regex($@"""{pattern}"":\s*""([^""{{<$][^""]*?)""", RegexOptions.IgnoreCase);
                var matches = regex.Matches(content);
                foreach (Match match in matches)
                {
                    var value = match.Groups[1].Value;
                    if (!string.IsNullOrWhiteSpace(value) && !_placeholderPattern.IsMatch(value))
                    {
                        Assert.Fail($"File '{Path.GetFileName(file)}' contains literal secret value for key containing '{pattern}': '{value}'");
                    }
                }
            }
        }
    }

    [Fact]
    public void Env_files_are_gitignored()
    {
        var root = FindRepoRoot();
        var gitignore = Path.Combine(root, ".gitignore");
        Assert.True(File.Exists(gitignore), ".gitignore file must exist");
        var content = File.ReadAllText(gitignore);
        Assert.Contains(".env", content);
    }

    [Fact]
    public void Env_example_file_exists()
    {
        var root = FindRepoRoot();
        var envExample = Path.Combine(root, ".env.example");
        Assert.True(File.Exists(envExample), ".env.example placeholder file must exist in repo root");
    }

    private static string FindRepoRoot()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir != null && !Directory.Exists(Path.Combine(dir.FullName, ".git")))
            dir = dir.Parent;
        return dir?.FullName ?? AppContext.BaseDirectory;
    }
}
