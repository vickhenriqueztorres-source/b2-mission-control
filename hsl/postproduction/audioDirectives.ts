/**
 * Diretrizes de Engenharia de Áudio e Pós-Produção
 * Derivadas do Módulo I do RAG Abraham (O Criador Zen)
 */

export interface HslAudioStemConfig {
  readonly stem_index: number;
  readonly stem_name: string;
  readonly target_bus: string;
  readonly gain_range_db: string;
  readonly treatment: string;
  readonly purpose: string;
}

export const HSL_FAIRLIGHT_AUDIO_STEMS: readonly HslAudioStemConfig[] = [
  {
    stem_index: 1,
    stem_name: 'Narrador (Principal)',
    target_bus: 'Bus 1 (Voice Master)',
    gain_range_db: '-6.0 dB a -3.0 dB (faixa amarela, sem clipping > 0 dB)',
    treatment: 'Voice Isolation Neural Engine, Dialog Leveler, EQ cirúrgico, De-Hummer',
    purpose: 'Pista principal de condução narrativa e autoridade vocal inabalável'
  },
  {
    stem_index: 2,
    stem_name: 'Tripulação / Vozes Secundárias',
    target_bus: 'Bus 2 (Secondary Dialogs)',
    gain_range_db: '-12.0 dB a -8.0 dB',
    treatment: 'Bandpass / Megaphone filter, simulação acústica de cockpit/rádio',
    purpose: 'Diálogos de contexto e personagens secundários'
  },
  {
    stem_index: 3,
    stem_name: 'Torre de Comando / Entrevistados',
    target_bus: 'Bus 2 (Secondary Dialogs)',
    gain_range_db: '-10.0 dB a -6.0 dB',
    treatment: 'Tratamento espacial, delay sutil e reverb controlado',
    purpose: 'Vozes externas de especialistas e comunicados oficiais'
  },
  {
    stem_index: 4,
    stem_name: 'Ambiência Contínua (Ambience Bed)',
    target_bus: 'Bus 3 (Beds & Atmospheres)',
    gain_range_db: '-24.0 dB a -18.0 dB',
    treatment: 'Filtro passa-altas a 80 Hz, texturas sonoras ininterruptas',
    purpose: 'Mascaramento acústico de respirações, cortes secos e silêncios digitais artificiais'
  },
  {
    stem_index: 5,
    stem_name: 'SFX / Efeitos Sonoros Dinâmicos',
    target_bus: 'Bus 4 (SFX Master)',
    gain_range_db: '-16.0 dB a -6.0 dB (picos pontuais)',
    treatment: 'Equalização dinâmica alinhada aos cortes e transições visuais',
    purpose: 'Ancoragem de impacto e quebra de padrão perceptual'
  },
  {
    stem_index: 6,
    stem_name: 'Trilha Sonora (Music Bed)',
    target_bus: 'Bus 5 (Music Master)',
    gain_range_db: '-20.0 dB padrão (-26.0 dB sob narração via ducking)',
    treatment: 'Audio ducking dinâmico / Range Mode (tecla R) atenuando -6dB a -10dB na fala',
    purpose: 'Sustentação emocional sem competir com o espectro da voz do narrador'
  }
] as const;

export const HSL_FAIRLIGHT_RESTORATION_RULES = {
  deHummerFrequencies: {
    americas: 60, // Hz (Brasil, EUA)
    europeAsia: 50, // Hz (Europa, Ásia)
    harmonicSweep: 'Varredura manual de harmônicos ímpares em zumbidos complexos'
  },
  noiseReduction: {
    preferredMode: 'Manual Learn Mode (amostra pura sem fala nos primeiros segundos de silêncio)',
    fallbackMode: 'Auto Speech Mode da Fairlight FX'
  },
  clickRepair: 'Sample-Level Editing com zoom máximo até os pontos de amostragem (dots)',
  targetLoudness: {
    integratedLufs: -14.0,
    maxTruePeakDb: -1.0,
    dialogLufsRange: '-16.0 a -14.0 LUFS'
  }
} as const;
