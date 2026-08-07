param(
  [Parameter(Mandatory=$true)][string]$Prod
)
$ErrorActionPreference = 'Continue'
$run = 'C:\B2-AI-STUDIO\mission-control\runs\RC2-PILOT-001'
$firefly = 'C:\B2-AI-STUDIO\links\firefly-automation'
$python = Join-Path $firefly '.venv\Scripts\python.exe'
if (-not (Test-Path $python)) { $python = 'python' }
$prodDir = Join-Path $run "productions\$Prod"
$guide = Join-Path $prodDir 'firefly_feed_guide.json'
$feedOut = Join-Path $prodDir 'feed_output.txt'
$workerOut = Join-Path $prodDir 'worker_output.txt'
$exitJson = Join-Path $prodDir 'command_exit_codes.json'
Set-Location $firefly
$started = (Get-Date).ToUniversalTime().ToString('o')
& $python -m firefly_bot.main --root $firefly --feed-guide $guide *> $feedOut
$feedExit = $LASTEXITCODE
$workerExit = $null
if ($feedExit -eq 0) {
  & $python -m firefly_bot.main --root $firefly --concurrency 1 --run *> $workerOut
  $workerExit = $LASTEXITCODE
}
$completed = (Get-Date).ToUniversalTime().ToString('o')
[pscustomobject]@{
  production = $Prod
  started_at = $started
  completed_at = $completed
  feed_exit_code = $feedExit
  worker_exit_code = $workerExit
  accepted_worker_exit_codes = @(0,10)
} | ConvertTo-Json -Depth 4 | Set-Content -Encoding UTF8 $exitJson
if ($feedExit -ne 0) { exit $feedExit }
if (($workerExit -ne 0) -and ($workerExit -ne 10)) { exit $workerExit }
exit 0
