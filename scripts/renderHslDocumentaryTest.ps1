$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$runId = 'HSL-DOC-EDIT-TEST-002'
$runDir = Join-Path $projectRoot "runs\$runId"
$assetsDir = Join-Path $runDir 'assets'
$refueling = Join-Path $assetsDir 'airport-refueling.png'
$fuelFarm = Join-Path $assetsDir 'airport-fuel-farm.png'
$narration = Join-Path $assetsDir 'narration.mp3'
$logo = Join-Path $projectRoot 'docs\assets\hsl\logo.png'
$filterScript = Join-Path $projectRoot 'scripts\hslDocumentaryTest.ffscript'
$output = Join-Path $runDir 'HSL_DOCS_DOCUMENTARY_EDIT_TEST_002.mp4'
$probeOutput = Join-Path $runDir 'ffprobe.json'
$manifestOutput = Join-Path $runDir 'manifest.json'

$required = @($refueling, $fuelFarm, $narration, $logo, $filterScript)
foreach ($path in $required) {
  if (-not (Test-Path -LiteralPath $path)) {
    throw "Missing required asset: $path"
  }
}

& ffmpeg -y `
  -loop 1 -framerate 30 -i $refueling `
  -loop 1 -framerate 30 -i $fuelFarm `
  -loop 1 -framerate 30 -i $logo `
  -f lavfi -i 'color=c=0x0D0E15:s=1920x1080:r=30:d=16' `
  -i $narration `
  -f lavfi -i 'sine=frequency=52:sample_rate=48000:duration=16' `
  -filter_complex_script $filterScript `
  -map '[vout]' -map '[aout]' `
  -t 16 -r 30 `
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p `
  -c:a aac -b:a 192k -ar 48000 `
  -movflags '+faststart' `
  $output

if ($LASTEXITCODE -ne 0) {
  throw "FFmpeg failed with exit code $LASTEXITCODE"
}

& ffprobe -v error -show_streams -show_format -of json $output | Set-Content -LiteralPath $probeOutput -Encoding utf8
if ($LASTEXITCODE -ne 0) {
  throw "ffprobe failed with exit code $LASTEXITCODE"
}

$manifest = [ordered]@{
  run_id = $runId
  project = 'Hidden Systems Lab'
  identity = 'HSL Docs'
  asset_type = 'documentary_edit_style_test'
  episode = 'The Hidden System That Keeps Planes Flying'
  reference_video = 'vidssave.com Why American Houses Are So Flimsy 360P.mp4'
  reference_use = 'editing-language analysis only; no frames or audio reused'
  narration = 'Before the runway, there is a chain most passengers never see. Storage tanks. Pumps. Valves. Timed checks. Fuel moves through each stage before it reaches the wing. The flight is visible. The system behind it is not.'
  disclosure = 'AI VISUALIZATION'
  format = [ordered]@{
    width = 1920
    height = 1080
    fps = 30
    duration_seconds = 16
    codec = 'h264'
    pixel_format = 'yuv420p'
  }
  source_assets = @(
    [ordered]@{ path = 'runs/HSL-DOC-EDIT-TEST-002/assets/airport-refueling.png'; role = 'original_generated_documentary_b_roll' },
    [ordered]@{ path = 'runs/HSL-DOC-EDIT-TEST-002/assets/airport-fuel-farm.png'; role = 'original_generated_documentary_b_roll' },
    [ordered]@{ path = 'docs/assets/hsl/logo.png'; role = 'official_brand_logo' },
    [ordered]@{ path = 'runs/HSL-DOC-EDIT-TEST-002/assets/narration.mp3'; role = 'elevenlabs_voiceover' }
  )
  output = 'HSL_DOCS_DOCUMENTARY_EDIT_TEST_002.mp4'
  generated_at = (Get-Date).ToUniversalTime().ToString('o')
}

$manifest | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $manifestOutput -Encoding utf8

Write-Output $output
