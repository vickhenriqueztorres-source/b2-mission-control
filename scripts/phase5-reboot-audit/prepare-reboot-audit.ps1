param(
  [string]$RunId = "REBOOT-E2E-002",
  [string]$ProductionId = "REBOOT-AUDIT-CONTROLLED"
)

$ErrorActionPreference = "Stop"
$repo = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$runDir = Join-Path $repo "runs\$RunId"
$beforeDir = Join-Path $runDir "database_before"
New-Item -ItemType Directory -Force -Path $runDir, $beforeDir | Out-Null

function Get-ProcIds([string]$name) {
  @(Get-Process -Name $name -ErrorAction SilentlyContinue | ForEach-Object { $_.Id })
}

$boot = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
$missionDb = Join-Path $repo "database\mission_control.db"
$fireflyDb = "C:\B2-AI-STUDIO\links\firefly-automation\data\firefly_jobs.db"

if (Test-Path $missionDb) { Copy-Item -LiteralPath $missionDb -Destination (Join-Path $beforeDir "mission_control.db") -Force }
if (Test-Path $fireflyDb) { Copy-Item -LiteralPath $fireflyDb -Destination (Join-Path $beforeDir "firefly_jobs.db") -Force }

$files = Get-ChildItem -Path (Join-Path $repo "runs") -Recurse -File -ErrorAction SilentlyContinue |
  Select-Object FullName, Length, LastWriteTimeUtc

$snapshot = [ordered]@{
  phase = "PRE-REBOOT"
  captured_at = (Get-Date).ToUniversalTime().ToString("o")
  run_id = $RunId
  production_id = $ProductionId
  job_id = $null
  job_state = $null
  last_event_id = $null
  mission_control_pids = Get-ProcIds "node"
  python_worker_pids = Get-ProcIds "python"
  chrome_pids = Get-ProcIds "chrome"
  last_boot_time = $boot.ToUniversalTime().ToString("o")
  mission_control_db = $missionDb
  firefly_jobs_db = $fireflyDb
  files = $files
}

$snapshot | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $runDir "pre_boot_snapshot.json")
$snapshot | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $runDir "reboot-audit-state.json")

Write-Host "PRE-REBOOT snapshot saved to $runDir"
Write-Host "Register the resume task, start a controlled real job in generating state, then reboot Windows physically."
