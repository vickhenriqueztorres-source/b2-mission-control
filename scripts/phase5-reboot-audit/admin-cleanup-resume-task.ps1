$ErrorActionPreference = "Continue"
$runPath = "C:\B2-AI-STUDIO\mission-control\runs\REBOOT-E2E-002"
Unregister-ScheduledTask -TaskName "B2MissionControlPhase5RebootAudit" -Confirm:$false *> "$runPath\admin_cleanup_resume_task_output.txt"
Get-ScheduledTask -TaskName "B2MissionControlPhase5RebootAudit" -ErrorAction SilentlyContinue |
  Select-Object TaskName, State, TaskPath |
  ConvertTo-Json -Depth 5 |
  Set-Content -Encoding UTF8 "$runPath\admin_cleanup_task_query_after.json"
Write-Host "Cleanup attempted. Outputs saved to $runPath"
