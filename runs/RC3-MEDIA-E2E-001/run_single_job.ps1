$ErrorActionPreference = 'Continue'
$run = 'C:\B2-AI-STUDIO\mission-control\runs\RC3-MEDIA-E2E-001'
$firefly = 'C:\B2-AI-STUDIO\links\firefly-automation'
$python = Join-Path $firefly '.venv\Scripts\python.exe'
if (-not (Test-Path $python)) { $python = 'python' }
$env:FIREFLY_DIAG_DIR = $run
$env:FIREFLY_CAPTURE_POLL_SCREENSHOTS = 'true'
Set-Location $firefly
$started = (Get-Date).ToUniversalTime().ToString('o')
& $python -m firefly_bot.main --root $firefly --feed-guide (Join-Path $run 'firefly_guide.json') *> (Join-Path $run 'feed_output.txt')
$feedExit = $LASTEXITCODE
$workerExit = $null
if ($feedExit -eq 0) {
  & $python -m firefly_bot.main --root $firefly --concurrency 1 worker-once *> (Join-Path $run 'worker_output.txt')
  $workerExit = $LASTEXITCODE
}
$completed = (Get-Date).ToUniversalTime().ToString('o')
[pscustomobject]@{ started_at=$started; completed_at=$completed; feed_exit_code=$feedExit; worker_exit_code=$workerExit } | ConvertTo-Json -Depth 3 | Set-Content -Encoding UTF8 (Join-Path $run 'command_exit_codes.json')
