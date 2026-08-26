import {HslEpisodeSeed, HslEditorialSceneSeed} from '../types/editorial';

const scene = (
  scene_id: string,
  chapter_id: string,
  chapter_title: string,
  narrative_function: string,
  visual_mode: HslEditorialSceneSeed['visual_mode'],
  visual_subject: string,
  claim_source_ids: readonly string[],
  voiceover: string,
  visual_function?: HslEditorialSceneSeed['visual_function']
): HslEditorialSceneSeed => ({
  scene_id,
  chapter_id,
  chapter_title,
  narrative_function,
  visual_mode,
  visual_subject,
  claim_source_ids,
  voiceover,
  ...(visual_function ? {visual_function} : {})
});

export const HSL_VIDEO_5_EPISODE_SEED: HslEpisodeSeed = {
  episode_id: 'HSL-VIDEO-005',
  title: 'The Invisible System That Keeps a City from Flooding',
  format: 'SYSTEM_ANATOMY',
  target_duration_minutes: 14,
  central_question: 'What hidden chain has to work before heavy rain becomes a normal street instead of a flooded city?',
  thesis: 'A city does not avoid flooding because water disappears. It survives because surfaces, gutters, storm drains, underground galleries, channels, detention basins, pumps, outfalls, maintenance crews and emergency rules move water faster than it can accumulate in the wrong place.',
  object_or_flow: 'One storm cell dropping water onto a city block, then moving through curb inlets, lateral pipes, trunk storm sewers, detention storage, pump stations, channels and outfalls',
  system_being_analyzed: 'The urban stormwater drainage system that converts rainfall into controlled flow',
  main_constraint: 'The system must collect and move water through fixed pipe capacity while debris, intense rainfall, flat terrain, tide levels, power, aging infrastructure and blocked inlets can all reduce the margin at once',
  primary_consequence: 'When one point loses capacity, water does not fail politely. It backs up, spreads across intersections, enters underpasses, overloads basins and can turn a local blockage into citywide disruption.',
  hero_visual: 'A cinematic night storm over a dense city reveals yellow rainwater paths flowing across streets into blue underground infrastructure, while orange bottlenecks show where a single blocked inlet or failed pump pushes water back to the surface.',
  causal_flow: ['rainfall', 'street_surface', 'curb_inlet', 'lateral_pipe', 'trunk_gallery', 'detention_storage', 'pump_station', 'channel', 'outfall', 'river_or_sea'],
  system_interfaces: ['roof_gutter', 'street_grade', 'curb_inlet', 'catch_basin', 'storm_sewer', 'detention_basin', 'pump_station', 'canal_gate', 'outfall', 'maintenance_route'],
  original_interpretation: 'A flooded street is often not the beginning of the problem. It is the moment an underground logistics system for water runs out of spare capacity.',
  counterargument_or_limitation: 'Stormwater systems vary by city, climate, terrain, age, maintenance, coastal conditions and design standard. This episode explains a representative urban drainage chain rather than one universal network.',
  audience_strategy: {
    primary_audience: 'People who see street flooding during storms but rarely see the underground infrastructure beneath the asphalt',
    awareness_level: 1,
    sophistication_level: 2,
    what_they_know: 'They know heavy rain can flood roads, block traffic and overwhelm neighborhoods.',
    knowledge_gap: 'They do not see the path water is supposed to take before flooding becomes visible.',
    mass_desire: 'Reveal the hidden machine that protects ordinary streets from water.',
    human_conflict: 'A driver sees one flooded underpass, but the actual failure may have started at a blocked grate, a full basin, a pump losing power or a river outlet already too high.',
    thumbnail_text: 'WHEN DRAINS FAIL',
    title_candidates: [
      'The Invisible System That Keeps a City from Flooding',
      'What Happens Underground When a City Floods'
    ],
    next_video_question: 'What happens when a city runs out of clean water pressure?'
  },
  sources: [
    {
      source_id: 'EPA-STORMWATER-RUNOFF-2026',
      category: 'primary',
      url: 'https://www.epa.gov/npdes/stormwater-discharges-municipal-sources',
      accessed_at: '2026-08-25',
      claims: [
        'EPA describes stormwater runoff from municipal areas as water from rain or snowmelt that flows over land and impervious surfaces.',
        'Municipal storm sewer systems collect runoff and discharge it to water bodies.'
      ],
      limitations: ['EPA explains regulatory and environmental context, not the hydraulic design of one specific city.']
    },
    {
      source_id: 'EPA-GREEN-INFRASTRUCTURE-2026',
      category: 'primary',
      url: 'https://www.epa.gov/green-infrastructure/what-green-infrastructure',
      accessed_at: '2026-08-25',
      claims: [
        'EPA describes green infrastructure as practices that use soil, vegetation and natural processes to manage stormwater.',
        'Green infrastructure can reduce and treat stormwater at or near where it falls.'
      ],
      limitations: ['Performance depends on design, maintenance, rainfall intensity and local soil conditions.']
    },
    {
      source_id: 'FEMA-URBAN-FLOODING-2026',
      category: 'primary',
      url: 'https://www.fema.gov/flood-maps/products-tools/risk-map',
      accessed_at: '2026-08-25',
      claims: [
        'FEMA flood risk resources support understanding and communicating flood hazards.',
        'Flood risk depends on local conditions and infrastructure exposure.'
      ],
      limitations: ['FEMA resources are risk and mapping focused, not a full engineering manual for drainage networks.']
    },
    {
      source_id: 'USGS-URBANIZATION-RUNOFF-2026',
      category: 'primary',
      url: 'https://www.usgs.gov/special-topics/water-science-school/science/urbanization-and-water-quality',
      accessed_at: '2026-08-25',
      claims: [
        'USGS explains that urbanization increases impervious surfaces and changes how water runs off the land.',
        'Runoff from impervious surfaces can reach streams faster than runoff from natural ground.'
      ],
      limitations: ['The USGS overview covers broad hydrologic effects rather than one city drainage design.']
    },
    {
      source_id: 'NOAA-HEAVY-RAIN-2026',
      category: 'primary',
      url: 'https://www.noaa.gov/education/resource-collections/weather-atmosphere/weather-systems-patterns',
      accessed_at: '2026-08-25',
      claims: [
        'NOAA educational resources describe heavy precipitation as part of weather systems and patterns.',
        'Rainfall intensity and storm behavior affect flood potential.'
      ],
      limitations: ['NOAA explains weather mechanisms, not municipal drain maintenance.']
    },
    {
      source_id: 'FHWA-HYDRAULIC-DRAINAGE-2026',
      category: 'technical',
      url: 'https://www.fhwa.dot.gov/engineering/hydraulics/',
      accessed_at: '2026-08-25',
      claims: [
        'FHWA hydraulic engineering resources address drainage and water interaction with transportation infrastructure.',
        'Roadway drainage and hydraulic capacity matter for keeping transportation corridors usable.'
      ],
      limitations: ['FHWA material is broad highway hydraulics guidance, not a single urban stormwater network.']
    },
    {
      source_id: 'ASCE-STORMWATER-INFRASTRUCTURE-2026',
      category: 'independent',
      url: 'https://infrastructurereportcard.org/cat-item/stormwater-infrastructure/',
      accessed_at: '2026-08-25',
      claims: [
        'ASCE describes stormwater infrastructure as including piped systems, detention basins, ditches, canals, channels and roadway conveyance systems.',
        'ASCE states that heavier single-day precipitation can strain stormwater infrastructure capacity.'
      ],
      limitations: ['ASCE is a professional engineering organization and infrastructure advocate, not a city-specific operator.']
    }
  ],
  scenes: [
    scene('HSL5_001', 'HOOK', 'When Rain Becomes Infrastructure', 'introduce_puzzle', 'generated_ai', 'A nighttime storm hits a city avenue as yellow water paths run toward curb inlets and blue underground tunnels glow beneath the street', [], 'A city can receive millions of gallons of rain in a single storm and still look normal fifteen minutes later. That only happens because the street is not just a street. It is the top layer of a hidden water machine. The gutters, grates, pipes, basins and pumps underneath are already deciding whether this rain becomes drainage or disaster.', 'scale'),
    scene('HSL5_002', 'HOOK', 'When Rain Becomes Infrastructure', 'early_evidence', 'generated_ai', 'Close view of a curb inlet swallowing street runoff while debris spins near the grate and a blue pipe network waits below', ['EPA-STORMWATER-RUNOFF-2026'], 'Stormwater is the water that runs across roofs, asphalt and concrete after rain. It moves fast because the city surface is hard. Soil can absorb some water. Pavement mostly redirects it. So the city has to behave like a funnel, guiding water to small openings before it spreads across the places people need to move.', 'invisible_process'),
    scene('HSL5_003', 'HOOK', 'When Rain Becomes Infrastructure', 'open_question', 'generated_ai', 'A cinematic city cutaway reveals rainwater moving from asphalt into a glowing underground pipe network, no text on screen', [], 'This episode follows one storm from the first drop on the asphalt to the moment water either disappears underground or comes back to the surface. The question is simple: what has to work before a city does not flood?', 'transition'),

    scene('HSL5_004', 'CH01', 'The Surface Layer', 'impervious_surface', 'generated_ai', 'Rainfall sheets across rooftops, sidewalks and asphalt as yellow flow lines converge toward the street crown and curb', ['USGS-URBANIZATION-RUNOFF-2026'], 'The first drainage structure is the shape of the city itself. Roofs slope. Streets crown. Curbs guide water. Driveways, parking lots and sidewalks all become miniature channels. Urbanization matters because hard surfaces reduce absorption and accelerate runoff. Before water reaches a pipe, gravity is already editing the path.', 'scale'),
    scene('HSL5_005', 'CH01', 'The Surface Layer', 'street_grade', 'generated_ai', 'A low intersection collects runoff from several blocks while lane markings vanish under shallow moving water', [], 'A few inches of elevation can decide where trouble starts. Water follows the lowest line. If an intersection sits below the surrounding blocks, it becomes a collection point. If the inlet is too small, blocked or simply overwhelmed, the street stops acting like a road and starts acting like temporary storage.', 'transition'),
    scene('HSL5_006', 'CH01', 'The Surface Layer', 'debris_load', 'generated_ai', 'Leaves, plastic and grit race through rainwater toward a grate where orange turbulence begins to build', [], 'The city is not moving clean laboratory water. Stormwater carries leaves, trash, oil, sand and whatever the street had been holding all week. That debris matters because drainage capacity is not only pipe diameter. It is also whether the opening is clear at the exact moment the storm arrives.', 'invisible_process'),

    scene('HSL5_007', 'CH02', 'The First Gate', 'catch_basin', 'generated_ai', 'Cutaway of a catch basin below a curb inlet with sediment at the bottom, water entering above and blue outlet pipe leaving the chamber', [], 'The first gate is often a catch basin. On the surface, it looks like a grate or curb opening. Below, it is a small chamber that receives runoff, traps some sediment and sends water into a lateral pipe. This little box is one of the reasons a street can drain without every piece of grit entering the main sewer immediately.', 'invisible_process'),
    scene('HSL5_008', 'CH02', 'The First Gate', 'inlet_capacity', 'generated_ai', 'Multiple curb inlets along a steep street capture yellow runoff while one inlet glows orange as flow bypasses it', [], 'Inlets do not capture everything. On a steep street, water can skim past a grate before it drops in. During intense rain, the flow arriving at the curb can be greater than the opening can accept. The extra water keeps traveling downhill, turning the next inlet into a backup plan.', 'transition'),
    scene('HSL5_009', 'CH02', 'The First Gate', 'blocked_inlet', 'generated_ai', 'An orange blockage covers part of a storm drain grate as yellow water pools outward into the road lane', [], 'This is how a tiny failure becomes visible. A blocked inlet does not need to break the entire drainage network. It only needs to stop water from entering at the right point. Then the street surface becomes the emergency route, and the flood appears to begin where the public can finally see it.', 'invisible_process'),

    scene('HSL5_010', 'CH03', 'Underground Rivers', 'lateral_pipe', 'generated_ai', 'Small blue lateral pipes from several catch basins merge into a larger underground storm sewer beneath a wet avenue', ['EPA-STORMWATER-RUNOFF-2026'], 'Below the street, small pipes connect to larger ones. Laterals from individual basins feed trunk storm sewers. The network starts to look less like plumbing and more like an underground river system built out of concrete, brick, plastic, steel or old masonry. Each merge adds flow and removes spare capacity.', 'scale'),
    scene('HSL5_011', 'CH03', 'Underground Rivers', 'trunk_gallery', 'generated_ai', 'Wide cinematic cutaway of a massive stormwater gallery under downtown carrying yellow flow through blue structural walls', [], 'The main gallery is where the hidden system becomes industrial. The pipe may be large enough for crews to walk through, but it still has limits. If too many upstream branches arrive at once, the water level rises inside the tunnel. The city above may still look calm while the underground space fills rapidly.', 'invisible_process'),
    scene('HSL5_012', 'CH03', 'Underground Rivers', 'junction_conflict', 'generated_ai', 'Two storm sewer branches meet in a dark junction chamber as turbulent yellow flows collide and orange pressure appears at the bend', [], 'Junctions are vulnerable because flows meet, bend and compete for space. A poorly timed surge from one branch can slow another. A bend, slope change or narrowing can turn smooth drainage into turbulence. The system is not only about carrying water forward. It is about preventing water from pushing backward.', 'transition'),

    scene('HSL5_013', 'CH04', 'Buying Time', 'detention_basin', 'generated_ai', 'A detention basin beside the city fills with yellow stormwater while blue outlet controls release a smaller controlled flow', ['EPA-GREEN-INFRASTRUCTURE-2026'], 'When pipes cannot move the whole storm at once, the city buys time. Detention basins, reservoirs and underground storage tanks hold water temporarily, then release it more slowly. The goal is not to stop rain. It is to delay the peak so downstream pipes, channels and rivers are not hit by every block at the same moment.', 'scale'),
    scene('HSL5_014', 'CH04', 'Buying Time', 'green_infrastructure', 'generated_ai', 'Rain garden, permeable pavement and planted curb extension absorb part of the runoff while the remaining yellow flow continues to a drain', ['EPA-GREEN-INFRASTRUCTURE-2026'], 'Some systems work by reducing the amount of water that reaches the pipes. Green infrastructure uses soil, plants and permeable surfaces to slow, store or filter runoff near where it falls. It is not decoration. In a stormwater system, a planted curb can be a small hydraulic device.', 'invisible_process'),
    scene('HSL5_015', 'CH04', 'Buying Time', 'basin_overflow', 'generated_ai', 'A storage basin reaches its limit during heavy rain and an orange overflow path begins to glow toward a channel', [], 'But storage is still capacity, and capacity can run out. When a basin fills, the next gallon has to go somewhere. Overflow routes are designed so water moves to channels, rivers or safer low areas. If those routes are blocked or undersized, the storage system stops buying time and starts passing the problem forward.', 'transition'),

    scene('HSL5_016', 'CH05', 'The Mechanical Layer', 'pump_station', 'generated_ai', 'Stormwater pump station interior with large pumps, wet well and blue discharge pipes lifting yellow water over a barrier', [], 'Some cities cannot rely on gravity alone. Flat neighborhoods, coastal areas, underpasses and low districts may need pumps. A pump station lifts water from a low point into a higher pipe, canal or river outlet. At that moment, drainage becomes mechanical. Flow depends on power, motors, valves and controls.', 'invisible_process'),
    scene('HSL5_017', 'CH05', 'The Mechanical Layer', 'underpass_risk', 'generated_ai', 'A road underpass during a storm drains toward a sump as orange warning light appears near the lowest point', ['FHWA-HYDRAULIC-DRAINAGE-2026'], 'An underpass is a perfect example of engineered vulnerability. The road dips below the surrounding ground, so every drop wants to collect there. If the inlet clogs or the pump fails, the low point can fill quickly. The danger is not just water depth. It is how fast a transportation corridor becomes a basin.', 'scale'),
    scene('HSL5_018', 'CH05', 'The Mechanical Layer', 'power_failure', 'generated_ai', 'A pump station control room loses power as backup generators glow and orange water level rises in the wet well', [], 'A storm can attack the system twice. It brings water, and it can also threaten the power that moves that water. Backup generators, alarms and crews matter because the drainage network has to work during the same weather that makes access harder. A pump is useful only if it runs when the city needs it most.', 'transition'),

    scene('HSL5_019', 'CH06', 'Where Water Leaves', 'channel_outfall', 'generated_ai', 'Blue storm sewer outfall releases yellow water into a concrete channel while river level rises nearby', [], 'Eventually the water has to leave the pipe network. It may discharge into a canal, creek, river, lake, harbor or ocean. The outfall is the final door. If the receiving water is low, drainage has room to empty. If the receiving water is high, tide-locked or already swollen, the city is trying to drain into a system that is pushing back.', 'scale'),
    scene('HSL5_020', 'CH06', 'Where Water Leaves', 'backwater', 'generated_ai', 'A high river pushes orange backwater into a storm sewer outfall while yellow city runoff queues upstream', [], 'Backwater is one of the strangest failures because the problem can come from the end of the line. Water inside the storm sewer may have a path, but the river outside has no room to receive it. The city can be flooded not because the drains forgot where to go, but because the destination is full.', 'invisible_process'),
    scene('HSL5_021', 'CH06', 'Where Water Leaves', 'flood_propagation', 'generated_ai', 'Aerial city map without text showing orange flood spread from one low drainage district into roads, blocks and transit corridors', ['FEMA-URBAN-FLOODING-2026'], 'Once water escapes the designed path, it creates a new one. It follows streets, underpasses, parking lots and building entrances. A single low district can disrupt buses, emergency routes, deliveries and power access. Flooding is physical, but its consequences move through the city like a network failure.', 'transition'),

    scene('HSL5_022', 'CONCLUSION', 'The Maintenance System', 'maintenance_crews', 'generated_ai', 'Night maintenance crew clears a storm drain grate before heavy rain while yellow water begins moving correctly into blue infrastructure', [], 'The last hidden system is maintenance. Drains have to be cleared. Sediment has to be removed. Pumps have to be tested. Sensors have to be watched. A drainage network is not finished when it is built. It has to be kept ready for a storm that may arrive before anyone has time to fix the weak point.', 'scale'),
    scene('HSL5_023', 'CONCLUSION', 'The Full Chain', 'complete_chain', 'generated_ai', 'Full cinematic city cutaway: rainfall, streets, inlets, pipes, basin, pump, channel and outfall all connected by yellow flow and blue infrastructure', [], 'Now the whole system is visible. Rain hits the surface. Streets guide it. Inlets capture it. Basins settle and redirect it. Pipes merge it. Storage delays it. Pumps lift it. Channels carry it away. Outfalls release it. The city stays dry only when every handoff keeps enough room for the next one.', 'transition'),
    scene('HSL5_024', 'CONCLUSION', 'The Hidden Product', 'deliver_payoff', 'generated_ai', 'A dry city street after the storm with curb inlets still glowing faintly and blue drainage tunnels visible beneath the pavement, no text on screen', [], 'So when a storm passes and the street is clear, the absence of flooding is not nothing. It is evidence. Somewhere below the curb, a hidden machine moved water before water could claim the city. The flood you never saw was the system doing its job.', 'scale')
  ],
  human_approval_status: 'APPROVED'
};
