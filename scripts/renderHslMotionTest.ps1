$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$runId = 'HSL-MOTION-TEST-001'
$runDir = Join-Path $projectRoot "runs\$runId"
$logo = Join-Path $projectRoot 'docs\assets\hsl\logo.png'
$filterScript = Join-Path $projectRoot 'scripts\hslMotionTest.ffscript'
$output = Join-Path $runDir 'HSL_DOCS_MOTION_TEST_001.mp4'
$probeOutput = Join-Path $runDir 'ffprobe.json'
$manifestOutput = Join-Path $runDir 'manifest.json'

New-Item -ItemType Directory -Path $runDir -Force | Out-Null

& ffmpeg -y `
  -f lavfi -i 'color=c=0x0D0E15:s=1920x1080:r=30:d=10' `
  -loop 1 -framerate 30 -i $logo `
  -f lavfi -i 'sine=frequency=55:sample_rate=48000:duration=10' `
  -f lavfi -i 'sine=frequency=880:sample_rate=48000:duration=0.14' `
  -f lavfi -i 'sine=frequency=660:sample_rate=48000:duration=0.18' `
  -filter_complex_script $filterScript `
  -map '[vout]' -map '[aout]' `
  -t 10 -r 30 `
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
  asset_type = 'brand_motion_test'
  episode = 'The Hidden System That Keeps Planes Flying'
  factual_claims = @()
  disclosure = 'AI VISUALIZATION'
  format = [ordered]@{
    width = 1920
    height = 1080
    fps = 30
    duration_seconds = 10
    codec = 'h264'
    pixel_format = 'yuv420p'
  }
  source_assets = @(
    [ordered]@{
      path = 'docs/assets/hsl/logo.png'
      role = 'official_brand_logo'
    }
  )
  output = 'HSL_DOCS_MOTION_TEST_001.mp4'
  generated_at = (Get-Date).ToUniversalTime().ToString('o')
}

$manifest | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $manifestOutput -Encoding utf8

Write-Output $output
