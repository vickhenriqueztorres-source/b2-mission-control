import fs from 'fs';
import path from 'path';
import {spawnSync} from 'child_process';
import {buildMotionDesign, HslMotionTemplate} from '../hsl/motion/motionDesign';

const samples: ReadonlyArray<Readonly<{narrativeFunction: string; visualSubject: string; expected: HslMotionTemplate}>> = [
  {narrativeFunction: 'reverse_map', visualSubject: 'The complete map resets at refinery production and begins moving forward', expected: 'FLOW_MAP'},
  {narrativeFunction: 'compare_routes', visualSubject: 'Five transport routes branch from a refinery: pipeline, ship, barge, railcar and truck', expected: 'BRANCHING_ROUTES'},
  {narrativeFunction: 'explain_contamination', visualSubject: 'Water droplets and particulate are separated from an otherwise clear fuel stream', expected: 'PROCESS_CUTAWAY'},
  {narrativeFunction: 'explain_status_change', visualSubject: 'A green available batch turns amber and stops after a failed verification checkpoint', expected: 'STATE_TRANSITION'},
  {narrativeFunction: 'explain_inventory', visualSubject: 'Three tank levels labeled received, settling or control, and available for dispatch', expected: 'CAPACITY_VS_AVAILABILITY'},
  {narrativeFunction: 'show_vehicle_constraint', visualSubject: 'Three aircraft calls compete for two refuelers with different travel distances', expected: 'BOTTLENECK'},
  {narrativeFunction: 'show_parallel_turnaround', visualSubject: 'Fueling runs beside catering, baggage, boarding and technical checks on a shared turnaround clock', expected: 'PARALLEL_TURNAROUND'},
  {narrativeFunction: 'trace_propagation', visualSubject: 'Delay passes from fuel dispatch to aircraft service completion and departure readiness', expected: 'DELAY_PROPAGATION'},
  {narrativeFunction: 'compare_systems', visualSubject: 'Hydrant and refueler routes share the same final aircraft connection', expected: 'BEFORE_AFTER'},
  {narrativeFunction: 'explain_verification', visualSubject: 'A sample jar, batch record and transfer valve align as three verification layers', expected: 'EVIDENCE_CARD'}
];

function command(binary: string, args: readonly string[]): void {
  const result = spawnSync(binary, [...args], {cwd: path.resolve(__dirname, '..'), encoding: 'utf8', stdio: 'inherit'});
  if (result.status !== 0) throw new Error(`HSL_MOTION_V2_PREVIEW_COMMAND_FAILED:${binary}:${result.status}`);
}

function run(): void {
  const projectRoot = path.resolve(__dirname, '..');
  const outputRoot = path.join(projectRoot, 'runs', 'HSL-MOTION-V2-PREVIEW');
  fs.mkdirSync(outputRoot, {recursive: true});
  const durationInFrames = 120;
  const scenes = samples.map((sample, index) => {
    const motionDesign = buildMotionDesign({...sample, variant: 'PROCESS'});
    if (motionDesign.template !== sample.expected) throw new Error(`HSL_MOTION_V2_TEMPLATE_MISMATCH:${sample.expected}:${motionDesign.template}`);
    return {
      sceneId: `HSL_MOTION_${String(index + 1).padStart(2, '0')}`, shotId: `HSL_MOTION_${String(index + 1).padStart(2, '0')}_V01`,
      variant: 'PROCESS', chapterTitle: 'MOTION V2', narrativeFunction: sample.narrativeFunction,
      visualMode: 'remotion', visualSubject: sample.visualSubject, durationInFrames,
      aiDisclosureRequired: false, transition: 'CUT', motionDesign
    };
  });
  const propsPath = path.join(outputRoot, 'preview-props.json');
  fs.writeFileSync(propsPath, `${JSON.stringify({
    title: 'Hidden Systems Lab Motion V2', fps: 30, width: 1920, height: 1080,
    totalDurationInFrames: scenes.length * durationInFrames, scenes
  }, null, 2)}\n`, 'utf8');
  const videoPath = path.join(outputRoot, 'HSL_MOTION_V2_PREVIEW.mp4');
  const cli = path.join(projectRoot, 'node_modules', '@remotion', 'cli', 'remotion-cli.js');
  command(process.execPath, [cli, 'render', 'remotion/index.ts', 'HslEpisode', videoPath, `--props=${propsPath}`, '--codec=h264', '--crf=18']);
  const contactSheetPath = path.join(outputRoot, 'contact-sheet.png');
  command('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', videoPath, '-vf', 'fps=1/4,scale=640:-1,tile=5x2', '-frames:v', '1', contactSheetPath]);
  const manifestPath = path.join(outputRoot, 'preview-manifest.json');
  fs.writeFileSync(manifestPath, `${JSON.stringify({
    schema: 'hsl.motion-v2.preview.v1', status: 'MOTION_V2_PREVIEW_RENDERED', module_count: samples.length,
    templates: samples.map((sample) => sample.expected), video_path: videoPath, contact_sheet_path: contactSheetPath, props_path: propsPath
  }, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify({status: 'MOTION_V2_PREVIEW_RENDERED', videoPath, contactSheetPath, manifestPath}, null, 2)}\n`);
}

try {
  run();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.stack || error.message : String(error)}\n`);
  process.exitCode = 1;
}
