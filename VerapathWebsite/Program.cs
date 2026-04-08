using System.Diagnostics;

var projectDir = Directory.GetCurrentDirectory();
var bat = Path.Combine(projectDir, "start-dev.bat");

Process.Start(new ProcessStartInfo("cmd.exe", $"/c \"{bat}\"")
{
    WorkingDirectory = projectDir,
    UseShellExecute = true
});
