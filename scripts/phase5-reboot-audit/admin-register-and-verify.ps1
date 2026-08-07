$ErrorActionPreference = "Continue"
Set-Location "C:\B2-AI-STUDIO\mission-control"
$runPath = "C:\B2-AI-STUDIO\mission-control\runs\REBOOT-E2E-002"
New-Item -ItemType Directory -Force -Path $runPath | Out-Null

& ".\scripts\phase5-reboot-audit\register-resume-task.ps1" -RunId "REBOOT-E2E-002" *> "$runPath\admin_register_resume_task_output.txt"
$registerExit = $LASTEXITCODE

Get-ScheduledTask -TaskName "B2MissionControlPhase5RebootAudit" |
  Select-Object TaskName, State, TaskPath |
  ConvertTo-Json -Depth 5 |
  Set-Content -Encoding UTF8 "$runPath\admin_scheduled_task_query.json"

Get-ScheduledTaskInfo -TaskName "B2MissionControlPhase5RebootAudit" |
  Select-Object LastRunTime, LastTaskResult, NextRunTime |
  ConvertTo-Json -Depth 5 |
  Set-Content -Encoding UTF8 "$runPath\admin_scheduled_task_info.json"

(Get-ScheduledTask -TaskName "B2MissionControlPhase5RebootAudit").Actions |
  Format-List * |
  Out-File -Encoding UTF8 "$runPath\admin_scheduled_task_actions.txt"

$pre = Test-Path "$runPath\pre_boot_snapshot.json"
$marker = Test-Path "$runPath\reboot-audit-state.json"
[pscustomobject]@{
  generated_at = (Get-Date).ToUniversalTime().ToString("o")
  register_exit_code = $registerExit
  pre_boot_snapshot_exists = $pre
  reboot_audit_state_exists = $marker
} | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 "$runPath\admin_pre_reboot_verification.json"

Write-Host "B2 Mission Control reboot task registration finished. Outputs saved to $runPath"
Read-Host "Press Enter to close this elevated PowerShell window"
