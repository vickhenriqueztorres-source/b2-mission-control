$ErrorActionPreference = 'Continue'
$run = 'C:\B2-AI-STUDIO\mission-control\runs\RC3-PILOT-001'
$firefly = 'C:\B2-AI-STUDIO\links\firefly-automation'
$python = Join-Path $firefly '.venv\Scripts\python.exe'
if (-not (Test-Path $python)) { $python = 'python' }
$env:FIREFLY_CAPTURE_POLL_SCREENSHOTS = 'true'

function Write-ProgressJson {
  param(
    [string]$Status,
    [string]$Production = '',
    [string]$Take = '',
    [string]$JobName = '',
    [int]$Completed = 0,
    [string]$Message = ''
  )
  [pscustomobject]@{
    timestamp = (Get-Date).ToUniversalTime().ToString('o')
    run_id = 'RC3-PILOT-001'
    status = $Status
    production = $Production
    take = $Take
    job_name = $JobName
    completed_jobs = $Completed
    message = $Message
  } | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 (Join-Path $run 'pilot_progress.json')
}

$completed = 0
$started = (Get-Date).ToUniversalTime().ToString('o')
Write-ProgressJson -Status 'RUNNING' -Completed 0 -Message 'pilot started'
Set-Location $firefly

for ($p = 1; $p -le 5; $p++) {
  $prod = ('PROD-{0:D2}' -f $p)
  $prodDir = Join-Path $run "productions\$prod"
  $env:FIREFLY_DIAG_DIR = $prodDir
  $guide = Join-Path $prodDir 'firefly_feed_guide.json'
  Write-ProgressJson -Status 'FEEDING' -Production $prod -Completed $completed -Message 'feeding production guide'
  & $python -m firefly_bot.main --root $firefly --feed-guide $guide *> (Join-Path $prodDir 'feed_output.txt')
  $feedExit = $LASTEXITCODE
  [pscustomobject]@{
    production = $prod
    feed_exit_code = $feedExit
    fed_at = (Get-Date).ToUniversalTime().ToString('o')
  } | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 (Join-Path $prodDir 'feed_result.json')
  if ($feedExit -ne 0) {
    Write-ProgressJson -Status 'FAIL' -Production $prod -Completed $completed -Message "feed failed exit=$feedExit"
    exit $feedExit
  }

  for ($t = 1; $t -le 4; $t++) {
    $take = ('TAKE-{0:D2}' -f $t)
    $jobName = ('RC3_PILOT_001_PROD_{0:D2}_TAKE_{1:D2}' -f $p, $t)
    $workerOut = Join-Path $prodDir ("worker_output_{0}.txt" -f $take)
    Write-ProgressJson -Status 'WORKER_RUNNING' -Production $prod -Take $take -JobName $jobName -Completed $completed -Message 'worker-once started'
    & $python -m firefly_bot.main --root $firefly --concurrency 1 worker-once *> $workerOut
    $workerExit = $LASTEXITCODE
    [pscustomobject]@{
      production = $prod
      take = $take
      job_name = $jobName
      worker_exit_code = $workerExit
      completed_at = (Get-Date).ToUniversalTime().ToString('o')
      accepted_worker_exit_codes = @(0)
    } | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 (Join-Path $prodDir ("command_exit_{0}.json" -f $take))
    if ($workerExit -ne 0) {
      Write-ProgressJson -Status 'FAIL' -Production $prod -Take $take -JobName $jobName -Completed $completed -Message "worker failed exit=$workerExit"
      exit $workerExit
    }
    node (Join-Path $run 'validate_take.js') --prod=$prod --take=$take --name=$jobName *> (Join-Path $prodDir ("validation_output_{0}.txt" -f $take))
    $validationExit = $LASTEXITCODE
    if ($validationExit -ne 0) {
      Write-ProgressJson -Status 'FAIL' -Production $prod -Take $take -JobName $jobName -Completed $completed -Message "validation failed exit=$validationExit"
      exit $validationExit
    }
    $completed += 1
    Write-ProgressJson -Status 'RUNNING' -Production $prod -Take $take -JobName $jobName -Completed $completed -Message 'take passed'
  }
  [pscustomobject]@{
    production = $prod
    status = 'PASS'
    completed_jobs = 4
    completed_at = (Get-Date).ToUniversalTime().ToString('o')
  } | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 (Join-Path $prodDir 'production_result.json')
}

$completedAt = (Get-Date).ToUniversalTime().ToString('o')
[pscustomobject]@{
  run_id = 'RC3-PILOT-001'
  started_at = $started
  completed_at = $completedAt
  status = 'PASS'
  completed_jobs = $completed
} | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 (Join-Path $run 'pilot_command_result.json')
Write-ProgressJson -Status 'PASS' -Completed $completed -Message 'pilot completed'
exit 0
