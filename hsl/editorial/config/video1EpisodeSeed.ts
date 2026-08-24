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

export const HSL_VIDEO_1_EPISODE_SEED: HslEpisodeSeed = {
  episode_id: 'HSL-VIDEO-001',
  title: 'The Hidden System That Keeps Planes Flying',
  format: 'THE_JOURNEY',
  target_duration_minutes: 16,
  central_question: 'How does jet fuel travel from its source to an aircraft while airports keep operating around the clock?',
  thesis: 'A reliable flight depends on a synchronized fuel chain whose real capacity is set by quality checks, storage, transfer routes, people and time rather than inventory alone.',
  object_or_flow: 'Jet fuel moving from refinery and intermediate storage through an airport fuel farm to the aircraft wing',
  system_being_analyzed: 'The multimodal upstream supply chain, airport receipt and storage, quality control, hydrant or refueler delivery, and aircraft interface',
  main_constraint: 'Usable throughput is limited by the slowest safe handoff among receipt, inspection, storage, pumping and aircraft servicing',
  primary_consequence: 'A local loss of throughput can consume schedule margin and affect servicing sequences even when the airport still has fuel in storage',
  hero_visual: 'A reversible refinery-to-wing map whose yellow flow line changes thickness at every handoff and exposes the point where inventory becomes usable throughput',
  original_interpretation: 'The visible product is a flight, but the hidden product is synchronized fuel logistics.',
  counterargument_or_limitation: 'This episode explains a representative system; supply modes, ownership, rules and dispensing layouts vary by country, airport size and local infrastructure.',
  audience_strategy: {
    primary_audience: 'Curious general viewers who have watched aircraft being refueled but have never seen the complete logistics chain behind that moment',
    awareness_level: 1,
    sophistication_level: 2,
    what_they_know: 'Aircraft receive fuel near the gate before departure',
    knowledge_gap: 'The aircraft connection is only the final handoff in a longer synchronized system',
    mass_desire: 'See the invisible infrastructure that turns an ordinary departure into a possible event',
    human_conflict: 'Passengers see a routine turnaround while operators protect quality and timing across a chain outside passenger view',
    thumbnail_text: 'BEFORE TAKEOFF',
    title_candidates: [
      'How Jet Fuel Reaches an Aircraft Without Stopping the Airport',
      'The Fuel Bottleneck Hidden Beneath Every Departure'
    ],
    next_video_question: 'What happens to the baggage system when one bag misses its connection?'
  },
  sources: [
    {
      source_id: 'FAA-AC-150-5230-4C-2026',
      category: 'primary',
      url: 'https://www.faa.gov/airports/resources/advisory_circulars/index.cfm/go/document.current/documentNumber/150_5230-4',
      accessed_at: '2026-08-20',
      claims: [
        'The FAA advisory circular covers aviation fuel storage, handling, dispensing and personnel training at airports.',
        'Fuel safety training includes fire prevention, bonding, access control, inspections, product verification, spill response and aircraft connection procedures.',
        'Airport-specific procedures and local rules can differ from the general practices described in the advisory circular.'
      ],
      limitations: ['The advisory circular is United States guidance and is not a universal description of every airport.']
    },
    {
      source_id: 'IATA-FUEL-INFRASTRUCTURE-2025',
      category: 'technical',
      url: 'https://www.iata.org/contentassets/d13875e9ed784f75bac90f000760e998/brief-access-to-fuel-infrastructure-to-enable-aviation.pdf',
      accessed_at: '2026-08-20',
      claims: [
        'Aviation fuel infrastructure includes a network of upstream and on-airport facilities designed to maintain supply for airline operations.',
        'Off-airport transport can combine ships, barges, pipelines, trucks and railcars, with intermediate storage helping maintain steady flow.',
        'A fuel farm can include receipt facilities, storage tanks and loading bays, and may connect to a hydrant pipeline network serving gates.',
        'Fuel-farm size and design depend on upstream robustness, flight demand, aircraft mix and expected growth.',
        'Multiple supply routes can improve resilience, while there is no single ownership or infrastructure model for every airport.'
      ],
      limitations: ['The brief focuses partly on infrastructure access and sustainable aviation fuel policy.']
    },
    {
      source_id: 'ACRP-AIRPORT-FUELING-2012',
      category: 'independent',
      url: 'https://nap.nationalacademies.org/read/22141/chapter/1',
      accessed_at: '2026-08-20',
      claims: [
        'Airport fueling systems commonly include storage tanks, filtering equipment, hydrant systems, truck refuelers, hoses and nozzles.',
        'Smaller airports may use less complex infrastructure while retaining responsibility for safe storage, handling and dispensing.',
        'Inspection, recordkeeping, maintenance and hazard analysis are recurring parts of airport fueling operations.'
      ],
      limitations: ['The synthesis records practices available when published and should be paired with current local standards.']
    },
    {
      source_id: 'IATA-TECHNICAL-FUEL-2026',
      category: 'technical',
      url: 'https://www.iata.org/en/programs/ops-infra/fuel/technical-fuel/',
      accessed_at: '2026-08-20',
      claims: [
        'Industry fuel-quality programs share inspection work and use standardized procedures for airport fuel facilities.',
        'Fuel contamination guidance addresses handling, storage and distribution, and disruption alerts support operational decisions.'
      ],
      limitations: ['Some detailed IATA standards and inspection materials require membership or purchase.']
    },
    {
      source_id: 'ICAO-SAF-GUIDE-2019',
      category: 'primary',
      url: 'https://www.icao.int/sites/default/files/environmental-protection/Documents/Sustainable-Aviation-Fuels-Guide_100519.pdf',
      accessed_at: '2026-08-20',
      claims: [
        'Aviation fuel supply across different states and demanding operating conditions requires strict quality assurance based on accepted standards.',
        'Certified drop-in blends are intended to remain compatible with existing aircraft fuel systems and distribution infrastructure.'
      ],
      limitations: ['The guide is focused on sustainable aviation fuels rather than a complete airport fueling operations manual.']
    }
  ],
  scenes: [
    scene('HSL_001', 'HOOK', 'The last visible handoff', 'introduce_system', 'generated_ai', 'A widebody aircraft at dawn with a hydrant dispenser connected beneath the wing, ground crew moving in a controlled turnaround', [], 'You can watch an aircraft receive fuel from the terminal window. A hose connects, numbers climb, and minutes later the airplane leaves. It looks like a delivery. But that hose is only the final visible link in a chain that began far beyond the airport.', 'scale'),
    scene('HSL_002', 'HOOK', 'The last visible handoff', 'early_evidence', 'remotion', 'A reverse-flow map pulls away from the wing through hydrant lines, fuel farm, terminal storage and refinery', ['IATA-FUEL-INFRASTRUCTURE-2025'], 'Behind the wing sits a fuel farm. Behind that may be a pipeline, road tanker, railcar, barge, ship, or several of them in sequence. The system is built to maintain flow, even though control changes hands at every transfer point.'),
    scene('HSL_003', 'HOOK', 'The last visible handoff', 'open_question', 'typography', 'THE AIRPORT CAN HAVE FUEL AND STILL LOSE TIME', [], 'That creates a strange possibility. An airport can have fuel in storage and still struggle to deliver it at the moment an aircraft needs it. To understand why, we have to follow one load of jet fuel backward, then run the entire system forward.'),

    scene('HSL_004', 'CH01', 'Before the airport', 'establish_origin', 'generated_ai', 'Aerial view of an unbranded coastal refinery at first light, distillation towers and pipe racks leading toward storage tanks', [], 'Our journey begins at a refinery, where crude oil is separated and processed into products with different physical properties and uses. Jet fuel is not simply anything that burns. It must leave production able to meet a demanding specification throughout the journey ahead.', 'atmosphere'),
    scene('HSL_005', 'CH01', 'Before the airport', 'explain_specification', 'remotion', 'A specification envelope surrounding a fuel droplet with temperature, density and compatibility checkpoints', ['ICAO-SAF-GUIDE-2019'], 'Aircraft cross hot ramps and extremely cold air at altitude. The fuel therefore belongs inside a defined performance envelope. Quality assurance is not a final inspection at the aircraft. It is a condition the product must preserve as it moves between facilities.'),
    scene('HSL_006', 'CH01', 'Before the airport', 'follow_flow', 'remotion', 'A batch identity card moves from production into a dedicated distribution lane', ['IATA-FUEL-INFRASTRUCTURE-2025'], 'Once released into distribution, a batch becomes both material and information. The liquid moves through hardware, while records identify what it is, where it came from, and which transfers it has passed. Physical flow and documented identity travel together.'),
    scene('HSL_007', 'CH01', 'Before the airport', 'compare_routes', 'remotion', 'Five transport routes branch from a refinery: pipeline, ship, barge, railcar and truck', ['IATA-FUEL-INFRASTRUCTURE-2025'], 'There is no universal route to an airport. Geography decides what is possible. Scale decides what is economical. A coastal hub may combine ships and pipelines. An inland airport may depend on rail, road, or a long pipeline shared with other demand.'),
    scene('HSL_008', 'CH01', 'Before the airport', 'explain_buffer', 'remotion', 'Intermediate storage tanks absorb uneven arrivals and release a steadier outbound flow', ['IATA-FUEL-INFRASTRUCTURE-2025'], 'Intermediate storage acts like a timing buffer. Large shipments can arrive in pulses, while the airport consumes fuel continuously. Tanks between those rhythms let the upstream network receive in one pattern and feed the airport in another, reducing exposure to an interrupted route.'),
    scene('HSL_009', 'CH01', 'Before the airport', 'explain_handoff', 'remotion', 'Custody markers pass across supplier, terminal operator, transporter and airport boundary', [], 'Every transfer changes more than location. It can change the operator, measurement point, schedule, equipment, and responsibility for the batch. The fuel must remain usable through all of those boundaries. A handoff is therefore both a movement and a test of coordination.'),
    scene('HSL_010', 'CH01', 'Before the airport', 'chapter_reframe', 'typography', 'THE FIRST HIDDEN PRODUCT IS CONTINUITY', [], 'Before fuel reaches the airport fence, the system has already performed its first invisible task: converting irregular production and transport into a dependable arrival stream. The airport does not control the whole route, but its operation depends on what that route can deliver next.'),
    scene('HSL_010A', 'CH01', 'Before the airport', 'bridge_to_airport', 'remotion', 'A moving batch crosses the airport boundary while its specification and custody record remain attached', [], 'That is the first principle of the journey: movement is useful only when identity and quality survive it. Distance alone does not bring fuel closer to a flight. Every kilometer must end in a handoff the next operator can accept and continue.'),

    scene('HSL_011', 'CH02', 'Entering the airport', 'establish_facility', 'generated_ai', 'Large unbranded airport fuel farm at sunrise with cylindrical tanks, receipt manifold, pumps and pipe racks beside distant runways', ['IATA-FUEL-INFRASTRUCTURE-2025'], 'Near the edge of a large airport is a place most passengers never notice: the fuel farm. It may contain receipt equipment, tanks, pumps, filters, control systems, and loading positions. This is where an external supply chain becomes an airport operation.', 'scale'),
    scene('HSL_012', 'CH02', 'Entering the airport', 'explain_receipt', 'remotion', 'An inbound batch pauses at a receipt gate before entering airport storage', ['FAA-AC-150-5230-4C-2026'], 'Arrival does not mean immediate availability. The receiving process has to confirm the product, the transfer path, and the conditions under which it can enter storage. The airport boundary is not an open pipe. It is a controlled interface with operating procedures.'),
    scene('HSL_013', 'CH02', 'Entering the airport', 'compare_supply_paths', 'remotion', 'Pipeline flow and bridger trucks converge on the same airport receipt system', ['IATA-FUEL-INFRASTRUCTURE-2025'], 'Some airports receive most of their fuel through pipelines. Others rely heavily on trucks, and some retain trucks as an alternative when a primary route is constrained. Each option carries a different relationship between shipment size, arrival frequency, road access, and transfer speed.'),
    scene('HSL_014', 'CH02', 'Entering the airport', 'explain_inventory', 'remotion', 'Three tank levels labeled received, settling or control, and available for dispatch', ['ACRP-AIRPORT-FUELING-2012'], 'Inside the farm, the total shown on a tank chart is not always the amount operators can use immediately. Fuel may be arriving, settling, being checked, reserved, or positioned in another tank. Inventory is a number. Availability is a state.'),
    scene('HSL_015', 'CH02', 'Entering the airport', 'explain_design', 'remotion', 'Fuel-farm capacity scales with upstream robustness, aircraft mix, flights and future demand', ['IATA-FUEL-INFRASTRUCTURE-2025'], 'The size of a fuel farm reflects more than today’s departures. Designers consider how reliable the upstream chain is, how many flights operate, which aircraft use the airport, and how demand may grow. Storage is partly a response to uncertainty outside the fence.'),
    scene('HSL_016', 'CH02', 'Entering the airport', 'show_control_room', 'remotion', 'Control-room dashboard links tank levels, valves, pumps, receipt lanes and outbound demand', [], 'From the control room, the farm is read as a moving system. Operators need to know which tank is receiving, which path is isolated, where flow is headed, and what demand is approaching. The important picture is not volume alone, but configuration over time.'),
    scene('HSL_017', 'CH02', 'Entering the airport', 'chapter_reframe', 'typography', 'STORAGE BUYS TIME. IT DOES NOT CREATE FLOW.', [], 'A larger tank can give operators more time to respond to an upstream interruption. It cannot make a blocked receipt line move, complete an inspection, or place a dispenser beneath a wing. Storage protects the operation, but only the connected system can deliver.'),

    scene('HSL_018', 'CH03', 'Quality through the chain', 'make_process_visible', 'generated_ai', 'Macro cinematic view inside a clean aviation-fuel manifold, one valve opening as amber liquid begins a controlled flow through stainless steel piping', [], 'Now look inside the pipes. The product appears uniform, but its usefulness depends on what has not entered it, what equipment has touched it, and whether every transfer followed the correct path. A small process error can change the status of a large volume.', 'invisible_process'),
    scene('HSL_019', 'CH03', 'Quality through the chain', 'explain_contamination', 'remotion', 'Water droplets and particulate are separated from an otherwise clear fuel stream', ['IATA-TECHNICAL-FUEL-2026'], 'Contamination control follows the fuel because exposure follows the fuel. Storage, handling, and distribution all create points that must be managed. Water and particles are not cinematic threats; they are operational reasons for sampling, filtration, drainage, inspection, and disciplined equipment use.'),
    scene('HSL_020', 'CH03', 'Quality through the chain', 'explain_verification', 'remotion', 'A sample jar, batch record and transfer valve align as three verification layers', ['FAA-AC-150-5230-4C-2026'], 'Quality is protected through layers rather than one magical test. Product verification, equipment checks, records, access control, and trained handling reduce the chance that the wrong material or an unsafe condition travels farther into the system.'),
    scene('HSL_021', 'CH03', 'Quality through the chain', 'explain_human_factor', 'remotion', 'Operator actions connect labeled tanks, hoses, valves and emergency controls', ['FAA-AC-150-5230-4C-2026'], 'The system is industrial, but it is not autonomous. People accept deliveries, identify products, connect equipment, inspect vehicles, respond to spills, and stop a transfer when conditions are wrong. Training is part of the infrastructure because hardware still depends on correct decisions.'),
    scene('HSL_022', 'CH03', 'Quality through the chain', 'explain_bonding', 'remotion', 'Bonding connection closes an electrical path before a fuel hose is opened', ['FAA-AC-150-5230-4C-2026'], 'Before flow begins near an aircraft or service vehicle, procedures address ignition sources and static electricity. Bonding is one example: create the intended electrical connection first, then transfer. The visible action is small because the hazard it manages should remain invisible.'),
    scene('HSL_023', 'CH03', 'Quality through the chain', 'explain_filtering', 'remotion', 'A filter vessel becomes a checkpoint between storage and outbound delivery', ['ACRP-AIRPORT-FUELING-2012'], 'Filters, hoses, nozzles, tanks, and hydrant components are not separate props. They form the physical route. Each item adds useful control, but also another inspection and maintenance obligation. Reliability comes from managing the chain as connected equipment.'),
    scene('HSL_024', 'CH03', 'Quality through the chain', 'explain_status_change', 'remotion', 'A green available batch turns amber and stops after a failed verification checkpoint', [], 'When a check raises a question, operators do not gain time by pretending the fuel is available. The responsible action may be to isolate a tank or pause a transfer. That protects safety, but it also removes capacity from the schedule until the issue is resolved.'),
    scene('HSL_025', 'CH03', 'Quality through the chain', 'connect_new_fuels', 'remotion', 'A certified drop-in blend joins the existing distribution network without a parallel airport system', ['ICAO-SAF-GUIDE-2019'], 'This is also why compatibility matters for new fuel pathways. A certified drop-in blend is designed to work with existing aircraft and distribution infrastructure after blending. Without compatibility, airports would face separate handling systems and many more opportunities for confusion.'),
    scene('HSL_026', 'CH03', 'Quality through the chain', 'chapter_reframe', 'typography', 'FUEL IN A TANK IS NOT YET FUEL AT THE WING', [], 'At this point, the airport owns or manages inventory that has survived several controls. Yet the passenger’s aircraft still has none of it. The system must now convert stored volume into precisely timed flow across an active apron.'),
    scene('HSL_026A', 'CH03', 'Quality through the chain', 'bridge_to_delivery', 'remotion', 'An available-fuel status signal releases a dispatch path from tank outlet toward the apron', [], 'Only after the product and route are available can dispatch solve the final distance. The question changes from whether the airport possesses fuel to which aircraft needs it, which path can serve that stand, and how the transfer fits the turnaround clock.'),

    scene('HSL_027', 'CH04', 'From tank to wing', 'introduce_final_route', 'generated_ai', 'Low-angle documentary shot of an unbranded hydrant dispenser beside a parked airliner, hose aligned toward the underwing fueling panel', ['ACRP-AIRPORT-FUELING-2012'], 'At a large gate, a compact hydrant dispenser may arrive beside the aircraft. It looks like a fuel truck, but it may carry little or no delivery inventory. Its job is to connect the aircraft to fuel moving through pipes beneath the apron.', 'scale'),
    scene('HSL_028', 'CH04', 'From tank to wing', 'explain_hydrant', 'remotion', 'Fuel farm pumps feed an underground hydrant loop with pits positioned at aircraft stands', ['IATA-FUEL-INFRASTRUCTURE-2025', 'ACRP-AIRPORT-FUELING-2012'], 'A hydrant system shifts transportation below ground. Pumps send fuel through a network that reaches selected gates. A dispenser connects a hydrant pit to the aircraft, controls the transfer, and provides the final filtering and measurement functions required by the operation.'),
    scene('HSL_029', 'CH04', 'From tank to wing', 'compare_refueler', 'remotion', 'A refueler truck carries fuel from a loading rack to a remote aircraft stand', ['ACRP-AIRPORT-FUELING-2012'], 'At another airport, or another part of the same airport, a refueler truck may carry the product itself. The truck loads at a facility, drives to the stand, transfers fuel, and returns. That route is flexible, but vehicle capacity and travel become part of timing.'),
    scene('HSL_030', 'CH04', 'From tank to wing', 'compare_systems', 'remotion', 'Hydrant and refueler routes share the same final aircraft connection', ['ACRP-AIRPORT-FUELING-2012'], 'Hydrant systems and refueler fleets solve different versions of the same problem. One invests in fixed distribution and short final connections. The other brings mobile storage to the aircraft. Neither is automatically right for every scale, layout, or traffic pattern.'),
    scene('HSL_031', 'CH04', 'From tank to wing', 'explain_fuel_order', 'remotion', 'Aircraft identity, fuel grade, requested amount and tank distribution form one verified order', ['FAA-AC-150-5230-4C-2026'], 'The final transfer begins with an instruction, not a guess. Fueling personnel must connect the correct aircraft, product, amount, and distribution request. This is where operational data meets physical equipment. A precise order turns inventory into the load needed for a specific flight.'),
    scene('HSL_032', 'CH04', 'From tank to wing', 'show_parallel_turnaround', 'remotion', 'Fueling runs beside catering, baggage, boarding and technical checks on a shared turnaround clock', [], 'Fueling does not own the gate. It shares a narrow window with baggage loading, catering, cleaning, boarding, and technical work. The safest path through that space depends on coordination, equipment placement, and rules for what can happen at the same time.'),
    scene('HSL_033', 'CH04', 'From tank to wing', 'explain_completion', 'remotion', 'Transfer stops, quantity is confirmed, hose disconnects and the service zone clears', ['FAA-AC-150-5230-4C-2026'], 'Completion is another handoff. Flow stops, delivered quantity is recorded, equipment is disconnected and secured, and the area must be ready for the next movement. The system has not finished when the tank is full. It finishes when the aircraft can safely continue.'),
    scene('HSL_034', 'CH04', 'From tank to wing', 'chapter_reframe', 'typography', 'THE HOSE IS THE END OF A SCHEDULE', [], 'What looked like a simple hose connection is the endpoint of production, transport, storage, quality control, dispatch, driving, and gate coordination. By the time fuel reaches the wing, most of the work that made the transfer possible has already happened elsewhere.'),

    scene('HSL_035', 'CH05', 'The real bottleneck', 'reveal_constraint', 'generated_ai', 'Elevated view of several aircraft requesting fuel simultaneously while one hydrant service lane and pump route become visually congested', [], 'Here is the bottleneck promised at the beginning. It is not necessarily an empty tank. It is the slowest safe handoff at the exact moment demand peaks: a receipt lane, a quality hold, a pump path, a vehicle, or an aircraft service position.', 'scale'),
    scene('HSL_036', 'CH05', 'The real bottleneck', 'distinguish_capacity', 'remotion', 'Stored inventory remains high while usable outbound throughput narrows at one transfer point', [], 'Inventory answers, how much is here? Throughput answers, how much can move correctly in the available time? Those numbers can tell very different stories. A full facility upstream of one constrained path can still produce a queue downstream.'),
    scene('HSL_037', 'CH05', 'The real bottleneck', 'show_peak_demand', 'remotion', 'A smooth daily demand curve rises into a bank of simultaneous departures', [], 'Average demand can hide the hardest minutes. Flight schedules often create waves of work, with several aircraft needing service in overlapping windows. The system must survive peaks, not merely satisfy a daily total. Timing converts demand into a capacity problem.'),
    scene('HSL_038', 'CH05', 'The real bottleneck', 'show_tank_constraint', 'remotion', 'One storage tank receives while another is unavailable and a third feeds the airport', [], 'Tank capacity also has configuration. One vessel may be receiving, another may be held for checks, and another may be feeding outbound operations. The total volume across all three can overstate what the farm can deliver right now.'),
    scene('HSL_039', 'CH05', 'The real bottleneck', 'show_route_constraint', 'remotion', 'Primary pipeline stops and truck deliveries attempt to replace only part of its continuous flow', ['IATA-FUEL-INFRASTRUCTURE-2025'], 'Redundant routes are valuable, but they are not always equal. Trucks may preserve supply when a pipeline is interrupted, yet road capacity, loading positions, travel time, and unloading rate determine how much of the original flow they can replace.'),
    scene('HSL_040', 'CH05', 'The real bottleneck', 'show_quality_constraint', 'remotion', 'A verification hold removes one batch from the available network while demand continues', ['IATA-TECHNICAL-FUEL-2026'], 'Quality control can become the deliberate bottleneck. If product status is uncertain, stopping its progress is the feature, not the failure. The operational challenge is having enough alternate capacity and schedule margin to protect both quality and continuity.'),
    scene('HSL_041', 'CH05', 'The real bottleneck', 'show_vehicle_constraint', 'remotion', 'Three aircraft calls compete for two refuelers with different travel distances', [], 'In a truck-served operation, the limiting resource may move around the airport. A vehicle is unavailable while loading, driving, servicing, or returning. Dispatchers are effectively solving a live routing problem in which every assignment changes what can happen next.'),
    scene('HSL_042', 'CH05', 'The real bottleneck', 'deliver_payoff', 'typography', 'USABLE CAPACITY IS A CHAIN, NOT A TANK', [], 'This is the answer to the opening puzzle. An airport may possess fuel yet lose time because stored volume and deliverable flow are different products. The practical capacity of the system is set by the handoff that cannot safely move any faster.'),

    scene('HSL_043', 'CH06', 'When timing breaks', 'begin_propagation', 'generated_ai', 'Cinematic airport turnaround at blue hour as a fuel service vehicle waits behind a blocked service path while the aircraft remains at the gate', [], 'Now let one handoff lose time. Not a disaster, just a blocked route, a late truck, an inspection, or unavailable equipment. The aircraft remains safe at the gate. But the schedule margin surrounding its turnaround begins to disappear.', 'reconstruction'),
    scene('HSL_044', 'CH06', 'When timing breaks', 'trace_propagation', 'remotion', 'Delay passes from fuel dispatch to aircraft service completion and departure readiness', [], 'The delay first appears in fuel dispatch. Then it reaches the service window. If other turnaround tasks cannot absorb it, departure readiness moves later. A local constraint becomes visible only after it travels through several linked decisions.'),
    scene('HSL_045', 'CH06', 'When timing breaks', 'show_recovery', 'remotion', 'Operations recover by rerouting supply, resequencing aircraft and using stored margin', [], 'Operators have recovery tools. They can reroute supply, change tank configuration, dispatch a different vehicle, resequence work, or use inventory accumulated earlier. Resilience is not the absence of disruption. It is the ability to preserve service while conditions change.'),
    scene('HSL_046', 'CH06', 'When timing breaks', 'explain_redundancy', 'remotion', 'Two upstream routes and multiple tanks provide alternatives around one unavailable segment', ['IATA-FUEL-INFRASTRUCTURE-2025'], 'Redundancy gives the system choices, but every choice has a capacity. A second route matters only if it can be activated, supplied, staffed, and connected in time. A backup on a diagram becomes resilience only when the operation can actually use it.'),
    scene('HSL_047', 'CH06', 'When timing breaks', 'explain_visibility', 'remotion', 'Disruption alert, inventory state and demand forecast converge in one decision view', ['IATA-TECHNICAL-FUEL-2026'], 'Information shortens the distance between a problem and a response. Industry disruption alerts, local inventory status, demand forecasts, and equipment reports help operators decide before the passenger sees an effect. Visibility is another form of usable capacity.'),
    scene('HSL_048', 'CH06', 'When timing breaks', 'state_limitation', 'typography', 'NO TWO AIRPORTS HAVE THE SAME FUEL MAP', ['FAA-AC-150-5230-4C-2026', 'IATA-FUEL-INFRASTRUCTURE-2025'], 'The exact map changes by location. Local rules differ. Small airports may use simpler systems. Large hubs may centralize storage and distribute through hydrant networks. Ownership and access models vary too. The mechanism is shared; the architecture is not universal.'),
    scene('HSL_049', 'CH06', 'When timing breaks', 'connect_consequence', 'remotion', 'A local fueling delay consumes buffers across gate, crew and downstream aircraft rotations', [], 'One late service does not automatically collapse an airport. The effect depends on available buffers and recovery choices. But aircraft, gates, and crews continue into later assignments. That is how a modest local delay can become part of a larger operational pattern.'),
    scene('HSL_049A', 'CH06', 'When timing breaks', 'human_consequence', 'remotion', 'The hidden operations map collapses back into a passenger departure board moving by several minutes', [], 'Passengers experience this network as a time on a screen. They do not see the rerouted truck, isolated tank, or dispatch decision that protected the flight. The system becomes visible mainly when its margin has already been consumed.'),

    scene('HSL_050', 'CONCLUSION', 'Run the system forward', 'reverse_map', 'remotion', 'The complete map resets at refinery production and begins moving forward', [], 'We began at the wing and traveled backward. Now run the system forward. A specification leaves production. Transport modes carry it toward the airport. Intermediate storage smooths arrivals. Receipt controls admit it into a new operating environment.'),
    scene('HSL_051', 'CONCLUSION', 'Run the system forward', 'summarize_control', 'remotion', 'The flow passes through storage state, quality checks, pumps and dispatch decisions', [], 'Inside the fuel farm, tanks buy time while checks protect product integrity. Operators configure routes and match available inventory to demand. Pumps, filters, vehicles, and records convert stored fuel into a controlled outbound service.'),
    scene('HSL_052', 'CONCLUSION', 'Run the system forward', 'complete_journey', 'generated_ai', 'One continuous cinematic tracking view follows an abstract yellow flow through airport pipes toward a real aircraft wing at sunrise', [], 'At the final handoff, a hydrant dispenser or refueler connects that service to one aircraft. The fuel crosses the last hose, but the journey succeeds because every earlier interface delivered the correct product with enough time remaining.', 'transition'),
    scene('HSL_053', 'CONCLUSION', 'The hidden product', 'partial_payoff', 'remotion', 'The hero map highlights quality, capacity, route, people and time as synchronized layers', [], 'The real system is not a row of tanks. It is the synchronization of quality, capacity, routes, equipment, people, information, and time. Remove one layer, and inventory can remain physically present while operational availability shrinks.'),
    scene('HSL_054', 'CONCLUSION', 'The hidden product', 'conclusion', 'typography', 'THE VISIBLE PRODUCT IS A FLIGHT. THE HIDDEN PRODUCT IS SYNCHRONIZATION.', [], 'The next time you see a hose beneath an aircraft wing, you are looking at the last ten meters of a journey that may span hundreds or thousands. The visible product is a flight. But the hidden product is synchronized fuel logistics.')
  ],
  human_approval_status: 'APPROVED'
};
