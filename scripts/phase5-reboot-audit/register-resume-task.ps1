param(
  [string]$RunId = "REBOOT-E2E-002"
)

$ErrorActionPreference = "Stop"
$scriptPath = Join-Path $PSScriptRoot "resume-after-reboot.ps1"
$taskName = "B2MissionControlPhase5RebootAudit"
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`" -RunId `"$RunId`""
$trigger = New-ScheduledTaskTrigger -AtLogOn
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Force | Out-Null
Write-Host "Registered scheduled task $taskName for post-reboot audit."
