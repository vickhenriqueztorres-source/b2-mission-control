param(
  [string]$RunId = "REBOOT-E2E-002"
)

$ErrorActionPreference = "Stop"
$repo = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$runDir = Join-Path $repo "runs\$RunId"
$afterDir = Join-Path $runDir "database_after"
New-Item -ItemType Directory -Force -Path $runDir, $afterDir | Out-Null

function Get-ProcIds([string]$name) {
  @(Get-Process -Name $name -ErrorAction SilentlyContinue | ForEach-Object { $_.Id })
}

$statePath = Join-Path $runDir "reboot-audit-state.json"
$pre = $null
if (Test-Path $statePath) {
  $pre = Get-Content -Raw -LiteralPath $statePath | ConvertFrom-Json
}

$boot = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
$missionDb = Join-Path $repo "database\mission_control.db"
$fireflyDb = "C:\B2-AI-STUDIO\links\firefly-automation\data\firefly_jobs.db"

if (Test-Path $missionDb) { Copy-Item -LiteralPath $missionDb -Destination (Join-Path $afterDir "mission_control.db") -Force }
if (Test-Path $fireflyDb) { Copy-Item -LiteralPath $fireflyDb -Destination (Join-Path $afterDir "firefly_jobs.db") -Force }

$post = [ordered]@{
  phase = "POST-REBOOT"
  captured_at = (Get-Date).ToUniversalTime().ToString("o")
  run_id = if ($pre) { $pre.run_id } else { $RunId }
  production_id = if ($pre) { $pre.production_id } else { $null }
  mission_control_pids = Get-ProcIds "node"
  python_worker_pids = Get-ProcIds "python"
  chrome_pids = Get-ProcIds "chrome"
  last_boot_time = $boot.ToUniversalTime().ToString("o")
  scheduled_task_resumed = $true
}

$post | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $runDir "post_boot_snapshot.json")

$comparison = [ordered]@{
  last_boot_time_before = if ($pre) { $pre.last_boot_time } else { $null }
  last_boot_time_after = $post.last_boot_time
  physical_reboot_confirmed = ($pre -and $pre.last_boot_time -ne $post.last_boot_time)
}
$comparison | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $runDir "boot_identity_comparison.json")

$processComparison = [ordered]@{
  mission_control_pids_before = if ($pre) { $pre.mission_control_pids } else { @() }
  mission_control_pids_after = $post.mission_control_pids
  python_worker_pids_before = if ($pre) { $pre.python_worker_pids } else { @() }
  python_worker_pids_after = $post.python_worker_pids
  chrome_pids_before = if ($pre) { $pre.chrome_pids } else { @() }
  chrome_pids_after = $post.chrome_pids
}
$processComparison | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $runDir "process_comparison.json")

$reconciliation = [ordered]@{
  executed_at = (Get-Date).ToUniversalTime().ToString("o")
  result = "RECOVERY_REQUIRED"
  reason = "Post-reboot script captured boot identity; Mission Control BootReconciler must be executed against a real controlled generating job before PASS can be assigned."
}
$reconciliation | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $runDir "reconciliation_result.json")

Write-Host "POST-REBOOT snapshot saved to $runDir"
