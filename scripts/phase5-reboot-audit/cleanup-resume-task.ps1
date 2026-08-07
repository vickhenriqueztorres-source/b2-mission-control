$ErrorActionPreference = "Stop"
$taskName = "B2MissionControlPhase5RebootAudit"
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
Write-Host "Removed scheduled task $taskName if it existed."
