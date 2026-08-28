const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const runDir = path.join(process.cwd(), 'runs', 'OOL-EP04-GPS-TEMPO', 'editorial', 'execution', 'scenes');
let validFrames = 0;
let validTakes = 0;
const invalid = [];

for (let i = 1; i <= 50; i++) {
  const num = String(i).padStart(3, '0');
  const framePath = path.join(runDir, `OOL_${num}`, 'firefly_start_frame.png');
  const takePath = path.join(runDir, `OOL_${num}`, 'firefly_take.mp4');

  const frameOk = fs.existsSync(framePath) && fs.statSync(framePath).size > 10240;
  if (frameOk) validFrames++;

  let takeOk = false;
  if (fs.existsSync(takePath) && fs.statSync(takePath).size > 51200) {
    const probe = spawnSync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      takePath
    ], { encoding: 'utf8' });
    const dur = parseFloat(probe.stdout || '0');
    if (dur > 0) {
      takeOk = true;
      validTakes++;
    }
  }

  if (!frameOk || !takeOk) {
    invalid.push({ scene: `OOL_${num}`, frameOk, takeOk });
  }
}

console.log(`Summary: Frames = ${validFrames}/50 | Takes = ${validTakes}/50`);
if (invalid.length > 0) {
  console.log('Invalid scenes:', JSON.stringify(invalid));
}
