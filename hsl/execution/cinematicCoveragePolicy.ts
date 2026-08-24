import {HslEditorialSceneContract, HslVisualMode} from '../editorial/types/editorial';
import {HslVisualShotVariant} from './types/execution';

export type HslGeneratedProvider = 'VEO' | 'KLING';

export interface HslCinematicShotDecision {
  readonly visualMode: HslVisualMode;
  readonly provider: HslGeneratedProvider | null;
  readonly requiresExactOverlay: boolean;
  readonly rationale: string;
}

const exactInformationPattern = /(number|metric|percentage|timeline|clock|deadline|chart|dataset|data record|identity|scan|message|status|capacity|compare|reconciliation|assignment|tracking|custody|document|evidence|field|flight candidate|time window|pressure|water age|residual|contaminant|testing|standard|advisory|zone|threshold)/i;
const spatialExplanationPattern = /(flow|route|journey|map|pipeline|network|conveyor|sortation|screening|transfer|handoff|branch|merge|buffer|bottleneck|propagat|reroute|system|path|water|pipe|main|service line|pump|tank|tower|reservoir|intake|treatment|filter|filtration|disinfection|storage|valve|hydrant|pressure zone|distribution)/i;

/**
 * Converts an editorial scene into a documentary shot mix. The editorial mode is
 * treated as intent, not as a command to fill the whole scene with one renderer.
 */
export class CinematicCoverageDirectorAgent {
  run(input: Readonly<{
    scene: HslEditorialSceneContract;
    variant: HslVisualShotVariant;
    index: number;
    shotCount: number;
    sourceGenerated: boolean;
  }>): HslCinematicShotDecision {
    const sourceMode = input.scene.visual_mode;
    const semantic = `${input.scene.narrative_function} ${input.scene.visual_subject}`;

    if (sourceMode === 'generated_ai' && input.sourceGenerated) {
      return {
        visualMode: 'generated_ai', provider: this.provider(semantic, input.variant),
        requiresExactOverlay: this.requiresExactOverlay(semantic, input.variant),
        rationale: 'The editorial scene is designed as an original generated documentary reconstruction.'
      };
    }

    if (sourceMode === 'licensed_real') {
      return {
        visualMode: 'licensed_real', provider: null, requiresExactOverlay: false,
        rationale: 'Verified real footage remains the strongest documentary evidence for this beat.'
      };
    }

    if (sourceMode === 'typography') {
      if (input.index === 0) {
        return {
          visualMode: 'typography', provider: null, requiresExactOverlay: true,
          rationale: 'One short typographic beat preserves the exact chapter statement.'
        };
      }
      return {
        visualMode: 'generated_ai', provider: 'KLING', requiresExactOverlay: false,
        rationale: 'The remainder of the chapter reframe becomes cinematic visual storytelling instead of repeated text.'
      };
    }

    if (sourceMode === 'remotion') {
      const exact = exactInformationPattern.test(semantic);
      const deterministicIndex = input.shotCount >= 4 ? 2 : Math.min(1, input.shotCount - 1);
      if (exact && input.index === deterministicIndex) {
        return {
          visualMode: 'remotion', provider: null, requiresExactOverlay: true,
          rationale: 'A single bounded deterministic beat preserves exact data, labels or chronology.'
        };
      }
      const provider = this.provider(semantic, input.variant);
      return {
        visualMode: 'generated_ai', provider,
        requiresExactOverlay: provider === 'VEO' && exact && input.variant === 'PROCESS',
        rationale: provider === 'VEO'
          ? 'Veo reveals the invisible system through spatial motion.'
          : 'Kling converts the explanatory beat into a physical cinematic documentary image.'
      };
    }

    return {
      visualMode: 'remotion', provider: null, requiresExactOverlay: true,
      rationale: 'Unknown editorial modes fall back to deterministic assembly.'
    };
  }

  private provider(semantic: string, variant: HslVisualShotVariant): HslGeneratedProvider {
    if (variant === 'ESTABLISH' || variant === 'CONSEQUENCE') return 'KLING';
    if (variant === 'PROCESS' && spatialExplanationPattern.test(semantic)) return 'VEO';
    if (variant === 'DETAIL' && /(flow|pipeline|conveyor|handoff|transfer|bottleneck|reroute|water|pipe|pump|valve|filter|tank|pressure|main)/i.test(semantic)) return 'VEO';
    return 'KLING';
  }

  private requiresExactOverlay(semantic: string, variant: HslVisualShotVariant): boolean {
    return variant === 'PROCESS' && exactInformationPattern.test(semantic);
  }
}
