import {HslEpisodeSeed} from '../types/editorial';

export const HSL_PILOT_EPISODE_SEED: HslEpisodeSeed = {
  episode_id: 'HSL-PILOT-001',
  title: 'The Hidden System That Keeps Planes Flying',
  format: 'THE_JOURNEY',
  target_duration_minutes: 16,
  central_question: 'How does fuel move from a refinery to an aircraft without interrupting continuous airport operations?',
  thesis: 'Airports depend on timed and redundant fuel logistics in which storage, quality control, delivery and aircraft schedules remain synchronized.',
  object_or_flow: 'Jet fuel moving from refinery and distribution terminals to the aircraft wing',
  system_being_analyzed: 'Refinery, terminal, airport fuel farm, hydrant or refueler truck, and aircraft interfaces',
  main_constraint: 'Fuel quality, storage capacity, safe handling and delivery timing must remain synchronized',
  primary_consequence: 'A local constraint can propagate into aircraft servicing and departure operations',
  hero_visual: 'A reversible refinery-to-wing systems map that exposes every handoff, inspection point and capacity constraint',
  original_interpretation: 'The visible product is a flight, while the hidden product is synchronized fuel logistics',
  counterargument_or_limitation: 'Airport supply and dispensing designs differ by region and airport scale, so one route cannot represent every operation',
  audience_strategy: {
    primary_audience: 'Curious general viewers who know aircraft are refueled but have never seen the complete logistics chain',
    awareness_level: 1,
    sophistication_level: 2,
    what_they_know: 'Aircraft receive fuel before departure and airports operate continuously',
    knowledge_gap: 'How refinery, storage, quality control and delivery timing form one connected system',
    mass_desire: 'Discover the invisible infrastructure that makes a familiar flight possible',
    human_conflict: 'Passengers expect a routine departure while one delayed handoff can affect the visible schedule',
    thumbnail_text: 'BEFORE TAKEOFF',
    title_candidates: [
      'The Hidden Journey of Jet Fuel: From Refinery to Aircraft',
      'How One Fuel Bottleneck Can Disrupt an Airport'
    ],
    next_video_question: 'Which other airport system can stop a departure even when the aircraft itself is ready?'
  },
  sources: [
    {
      source_id: 'FAA-AC-150-5230-4C',
      category: 'primary',
      url: 'https://www.faa.gov/regulations_policies/advisory_circulars/index.cfm/go/document.information/documentID/1040345',
      accessed_at: '2026-08-19',
      claims: ['Airport fuel systems require defined storage, handling, dispensing and personnel training practices.'],
      limitations: ['FAA guidance is specific to the United States regulatory context.']
    },
    {
      source_id: 'ACRP-OVERVIEW-FUELING',
      category: 'technical',
      url: 'https://nap.nationalacademies.org/read/22141/chapter/1',
      accessed_at: '2026-08-19',
      claims: ['Airport fueling operations can use storage tanks, hydrant systems, truck refuelers, filters, hoses and nozzles.'],
      limitations: ['The overview describes multiple system types rather than one universal airport layout.']
    },
    {
      source_id: 'ICAO-SAF-GUIDE',
      category: 'independent',
      url: 'https://www.icao.int/sites/default/files/environmental-protection/Documents/Sustainable-Aviation-Fuels-Guide_100519.pdf',
      accessed_at: '2026-08-19',
      claims: ['Product integrity and contamination controls continue through distribution and storage facilities.'],
      limitations: ['The document includes sustainable aviation fuel context and is not an airport design standard.']
    }
  ],
  scenes: [
    {
      scene_id: 'HSL_001', chapter_id: 'HOOK', chapter_title: 'The visible flight',
      narrative_function: 'introduce_system', visual_mode: 'generated_ai', visual_function: 'scale',
      visual_subject: 'Aircraft wing connected to an airport hydrant dispenser on the apron',
      claim_source_ids: [],
      voiceover: 'A flight becomes visible at the runway. But the system that makes it possible begins much earlier, beyond the gate and outside the passenger view.'
    },
    {
      scene_id: 'HSL_002', chapter_id: 'CH01', chapter_title: 'Before the aircraft',
      narrative_function: 'follow_flow', visual_mode: 'remotion',
      visual_subject: 'Reversible refinery-to-wing flow map',
      claim_source_ids: ['ACRP-OVERVIEW-FUELING'],
      voiceover: 'Fuel passes through a chain of storage, transfer and dispensing interfaces. Each handoff changes who controls the flow and what can slow it down.'
    },
    {
      scene_id: 'HSL_003', chapter_id: 'CH02', chapter_title: 'Entering the airport',
      narrative_function: 'establish_context', visual_mode: 'licensed_real',
      visual_subject: 'Airport fuel farm exterior and pipe manifold',
      claim_source_ids: ['FAA-AC-150-5230-4C'],
      voiceover: 'At the airport, fuel enters an operating environment with specific storage, handling and dispensing practices. The fuel farm is an active control point, not a passive warehouse.'
    },
    {
      scene_id: 'HSL_004', chapter_id: 'CH03', chapter_title: 'Storage is not just storage',
      narrative_function: 'explain_mechanism', visual_mode: 'generated_ai', visual_function: 'invisible_process',
      visual_subject: 'Fuel moving through a manifold while valves open in a controlled sequence',
      claim_source_ids: ['ICAO-SAF-GUIDE'],
      voiceover: 'Product integrity has to survive distribution and storage. Water, contamination and an incorrect transfer can turn inventory into a constraint instead of a reserve.'
    },
    {
      scene_id: 'HSL_005', chapter_id: 'CH04', chapter_title: 'From tank to wing',
      narrative_function: 'handoff', visual_mode: 'remotion',
      visual_subject: 'Animated comparison of hydrant and truck refueler paths',
      claim_source_ids: ['ACRP-OVERVIEW-FUELING'],
      voiceover: 'Some aircraft receive fuel through hydrant infrastructure. Others are served by refueler trucks. Different routes solve the same final handoff to the wing.'
    },
    {
      scene_id: 'HSL_006', chapter_id: 'CH05', chapter_title: 'The bottleneck',
      narrative_function: 'reveal_constraint', visual_mode: 'remotion',
      visual_subject: 'Capacity and timing timeline with one constrained transfer point',
      claim_source_ids: ['FAA-AC-150-5230-4C', 'ACRP-OVERVIEW-FUELING'],
      voiceover: 'The bottleneck is not always a shortage of fuel. It can be a storage limit, an inspection, a transfer rate or the number of aircraft that must be served at once.'
    },
    {
      scene_id: 'HSL_007', chapter_id: 'CH06', chapter_title: 'When timing breaks',
      narrative_function: 'propagation', visual_mode: 'remotion',
      visual_subject: 'Causal propagation diagram from fuel service to departure sequence',
      claim_source_ids: [],
      voiceover: 'When one handoff loses time, the effect can move forward through servicing and departure preparation. The failure is local, but the schedule is connected.'
    },
    {
      scene_id: 'HSL_008', chapter_id: 'CONCLUSION', chapter_title: 'The hidden product',
      narrative_function: 'conclusion', visual_mode: 'typography',
      visual_subject: 'The refinery-to-wing map running forward to the aircraft',
      claim_source_ids: [],
      voiceover: 'The aircraft is what passengers see. The hidden product is synchronization: fuel, equipment, people and time arriving at the same point before the flight can leave.'
    }
  ],
  human_approval_status: 'APPROVED'
};
