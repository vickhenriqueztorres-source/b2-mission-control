export const HSL_OFFICIAL_PRODUCTION_RULES = {
  narrationProvider: 'voicebox',
  officialVoiceName: 'Echo',
  voiceboxPresetVoiceId: 'am_echo',
  minimumGeneratedCoverageRatio: 0.7,
  maximumRemotionCoverageRatio: 0.22,
  maximumConsecutiveRemotionShots: 1,
  requirePhotorealStartFrames: true,
  forbidLocalProxyAssets: true,
  forbidFlatDiagramStartFrames: true,
  visualIdentityContractVersion: 'HSL_VISUAL_IDENTITY_V2',
  requireApprovedVisualReferenceLineage: true,
  forbidProceduralPrevisAsProductionFrame: true,
  requireApprovalBoundToContactSheetHash: true,
  forbidAutomaticHumanApproval: true,
  defaultKlingModel: 'Kling 3.0',
  defaultVeoModel: 'Veo 3.1 Fast'
} as const;

export function assertOfficialHslNarrationConfig(env: NodeJS.ProcessEnv = process.env): void {
  const provider = (env.HSL_NARRATION_PROVIDER || '').trim().toLowerCase();
  const voiceName = (env.HSL_OFFICIAL_VOICE_NAME || '').trim().toLowerCase();
  const presetVoiceId = (env.HSL_VOICEBOX_PRESET_VOICE_ID || '').trim().toLowerCase();
  if (provider !== HSL_OFFICIAL_PRODUCTION_RULES.narrationProvider) {
    throw new Error(`HSL_OFFICIAL_VOICEBOX_REQUIRED: expected HSL_NARRATION_PROVIDER=voicebox, got ${provider || 'EMPTY'}`);
  }
  if (voiceName !== HSL_OFFICIAL_PRODUCTION_RULES.officialVoiceName.toLowerCase()) {
    throw new Error(`HSL_OFFICIAL_ECHO_VOICE_REQUIRED: expected HSL_OFFICIAL_VOICE_NAME=Echo, got ${voiceName || 'EMPTY'}`);
  }
  if (presetVoiceId !== HSL_OFFICIAL_PRODUCTION_RULES.voiceboxPresetVoiceId) {
    throw new Error(`HSL_OFFICIAL_ECHO_PRESET_REQUIRED: expected HSL_VOICEBOX_PRESET_VOICE_ID=am_echo, got ${presetVoiceId || 'EMPTY'}`);
  }
}
