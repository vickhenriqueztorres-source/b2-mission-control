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

export const HSL_VIDEO_2_EPISODE_SEED: HslEpisodeSeed = {
  episode_id: 'HSL-VIDEO-002',
  title: 'What Happens When Your Bag Misses Its Connection?',
  format: 'FAILURE',
  target_duration_minutes: 15,
  central_question: 'What happens inside an airport after a checked bag misses its connecting flight, and how does the baggage network route it back to its passenger?',
  thesis: 'A connecting bag succeeds only while its physical location, digital identity, custody and remaining transfer time stay synchronized; when that agreement breaks, the airport must turn a normal bag into a traceable exception and build a new journey around it.',
  object_or_flow: 'One checked suitcase and its digital routing record moving through acceptance, screening, sortation, aircraft loading, transfer, exception handling, reflight and final delivery',
  system_being_analyzed: 'Airport baggage handling systems, baggage reconciliation, transfer operations, airline messaging, ground handlers and delayed-baggage recovery',
  main_constraint: 'The bag must complete every required physical and informational handoff before the outbound flight closes, so usable transfer capacity is limited by the slowest remaining step and the time left to perform it',
  primary_consequence: 'A passenger can make the connection while the bag misses it, forcing the system to identify the last confirmed handoff, select a new route and reunite the bag after arrival',
  hero_visual: 'A split airport map follows one yellow suitcase and one blue data record through the same connection until a shrinking transfer clock forces the physical route to branch into exception handling and reflight',
  causal_flow: ['passenger_handover', 'identity_and_screening', 'origin_sortation', 'first_aircraft', 'transfer_sortation', 'outbound_load', 'exception_handling', 'reflight', 'passenger_reunion'],
  system_interfaces: ['bag_tag_scan', 'security_clearance', 'sortation_divert', 'aircraft_load_confirmation', 'transfer_custody', 'reflight_message', 'arrival_delivery'],
  original_interpretation: 'The visible object is a suitcase. The hidden product is agreement between identity, location and time.',
  counterargument_or_limitation: 'Baggage layouts, security rules, airline responsibilities, minimum connection times and recovery procedures vary by airport, carrier, country, aircraft type and itinerary; this episode explains a representative transfer system rather than one universal airport.',
  audience_strategy: {
    primary_audience: 'Curious travelers who have checked a bag through a connecting itinerary and wondered why they can reach the next flight while their suitcase does not',
    awareness_level: 1,
    sophistication_level: 2,
    what_they_know: 'A printed tag is attached at check-in and the bag should appear at the final carousel',
    knowledge_gap: 'The passenger and bag move through separate systems with different routes, checkpoints, custody changes and deadlines',
    mass_desire: 'See what the airport does behind the walls when a familiar travel promise breaks',
    human_conflict: 'A passenger can run directly to a gate while the bag must be unloaded, identified, transferred, screened where required, sorted, reconciled and physically loaded before the same door closes',
    thumbnail_text: 'LEFT BEHIND',
    title_candidates: [
      'Why Your Bag Misses a Flight Even When You Make It',
      'The Hidden Race to Move Your Bag Between Flights'
    ],
    next_video_question: 'Why do airports run out of gates before they run out of runway?'
  },
  sources: [
    {
      source_id: 'IATA-BAGGAGE-TRACKING-2026',
      category: 'primary',
      url: 'https://www.iata.org/en/programs/ops-infra/baggage/baggage-tracking/',
      accessed_at: '2026-08-21',
      claims: [
        'IATA Resolution 753 requires member airlines to track baggage at passenger acceptance, aircraft loading, transfer delivery or acquisition, and return to the passenger.',
        'Airports often provide baggage handling, reconciliation, sortation and arrival-scanning infrastructure that generates tracking data used by airlines.',
        'Tracking data supports hot-connection management, performance analysis and the recovery of mishandled baggage.',
        'Airlines, airports and ground handlers must collaborate because baggage custody and tracking events cross organizational boundaries.'
      ],
      limitations: ['Resolution 753 defines minimum tracking events, not one universal physical baggage-handling layout.']
    },
    {
      source_id: 'IATA-R753-IMPLEMENTATION-GUIDE-2023-I4',
      category: 'technical',
      url: 'https://www.iata.org/contentassets/5c4aa8b8b3b1432697d2bf3301450684/reso753-implementation-guide---2023_issue-4.02.pdf',
      accessed_at: '2026-08-21',
      claims: [
        'A mishandled bag is generally assigned to another flight and reinserted into the normal departure baggage process.',
        'When the original carrier keeps custody, the original passenger acceptance remains valid and the new aircraft loading event should be recorded.',
        'When a different carrier receives the bag, the physical exchange or delivery to an agreed transfer point should be recorded.',
        'Delivery of a mishandled bag to a passenger at a home or hotel should be recorded as the final delivery event.',
        'Airport baggage handling and reconciliation systems can provide sortation, exception-handling, transfer and aircraft-loading tracking data.'
      ],
      limitations: ['The guide addresses tracking obligations and leaves many local irregular-baggage procedures to carriers and handlers.']
    },
    {
      source_id: 'IATA-BAGGAGE-STANDARDS-2026',
      category: 'technical',
      url: 'https://www.iata.org/en/programs/ops-infra/baggage/standards/',
      accessed_at: '2026-08-21',
      claims: [
        'IATA baggage standards include a ten-digit license plate identifier, transfer messages, reflight messaging and interline connecting-time intervals.',
        'Standardized messages allow baggage routing and handling information to move between airlines, airports and service providers.',
        'Reflight messaging exists to communicate a changed flight assignment for mishandled baggage.'
      ],
      limitations: ['Detailed implementation rules are contained in controlled IATA manuals and local operating procedures.']
    },
    {
      source_id: 'TSA-CHECKED-BAGGAGE-ROADMAP-2025',
      category: 'primary',
      url: 'https://www.tsa.gov/sites/default/files/checked_baggage_roadmap.pdf',
      accessed_at: '2026-08-21',
      claims: [
        'United States checked-baggage screening uses explosives detection systems and explosives trace detection in multiple levels of alarm resolution.',
        'Bags that alarm during automated screening can move to image review and then to manual inspection when the alarm cannot be resolved.',
        'Oversize bags or bags that cannot follow the main automated path may require a different screening process.'
      ],
      limitations: ['The roadmap describes the United States security environment and should not be generalized to every country.']
    },
    {
      source_id: 'SITA-BAGGAGE-INSIGHTS-2026',
      category: 'technical',
      url: 'https://prod.sita.aero/about-us/pressroom/news-releases/tech-drove-down-mishandled-bag-rates-by-23-in-2025-but-mishandling-still-costs-the-industry-%246.3-billion-a-year',
      accessed_at: '2026-08-21',
      claims: [
        'Transfers remained the largest baggage-mishandling driver in 2025, accounting for 39 percent of cases in the SITA industry dataset.',
        'Delayed baggage creates recovery, rerouting and delivery work after the passenger journey has continued.',
        'The industry is expanding real-time tracking, automated reflight and shared location data to shorten recovery.',
        'Baggage performance depends on connecting data across airlines, airports and ground handlers.'
      ],
      limitations: ['SITA figures are industry estimates based on its datasets and product ecosystem, not a census of every bag worldwide.']
    },
    {
      source_id: 'HEATHROW-BAGGAGE-SYSTEM-2023',
      category: 'independent',
      url: 'https://mediacentre.heathrow.com/pressrelease/detail/18540',
      accessed_at: '2026-08-21',
      claims: [
        'Heathrow reported that its systems scan and sort up to 140,000 departing bags per day between check-in and the airfield.',
        'A planned replacement system for Terminal 2 was designed for 31,000 bags per day and greater operational resilience.',
        'Airport systems, airlines and ground handlers divide responsibility across different portions of the baggage journey.'
      ],
      limitations: ['Heathrow is a large hub and its scale should not be treated as representative of smaller airports.']
    },
    {
      source_id: 'UK-HSE-BAGGAGE-HANDLING-2025',
      category: 'independent',
      url: 'https://www.hse.gov.uk/airtransport/topics/baggage.htm',
      accessed_at: '2026-08-21',
      claims: [
        'Manual baggage handling occurs at aircraft holds, security points and check-in interfaces and creates ergonomic risks for workers.',
        'Mechanical belt loaders and extending belt loaders can reduce parts of the manual movement into and out of aircraft holds.',
        'Baggage loading remains a combination of automated transport and human handling.'
      ],
      limitations: ['The guidance focuses on worker health and safety in the United Kingdom rather than end-to-end baggage routing.']
    }
  ],
  scenes: [
    scene('HSL2_001', 'HOOK', 'Two races', 'introduce_failure', 'generated_ai', 'A connecting passenger runs through a terminal above while the same yellow suitcase travels through a vast baggage system below', [], 'Your inbound flight arrives late. You run through the terminal, reach the next gate, and board with seconds to spare. Your suitcase had the same itinerary. But it did not have the same route, and it did not get to skip a single required step.', 'scale'),
    scene('HSL2_002', 'HOOK', 'Two races', 'early_evidence', 'remotion', 'Split map compares the passenger shortcut to the bag route through unloading, transfer induction, sortation and outbound loading', ['IATA-BAGGAGE-TRACKING-2026'], 'The passenger moves through signs, corridors, and a boarding pass. The bag moves through unloading crews, vehicles, conveyors, scanners, databases, sorters, make-up areas, and another loading team. A connection is therefore not one race. It is two systems trying to meet the same departure.'),
    scene('HSL2_003', 'HOOK', 'Two races', 'open_question', 'typography', 'THE PASSENGER MADE IT. THE BAG DID NOT.', [], 'So what happens when those systems separate? The suitcase does not simply become lost. It changes status. The normal journey ends, an exception journey begins, and the airport must prove where the bag was before it can decide where the bag goes next.'),

    scene('HSL2_004', 'CH01', 'A suitcase becomes data', 'establish_identity', 'licensed_real', 'Close documentary footage of a baggage tag being printed and attached at an airport check-in counter', ['IATA-BAGGAGE-STANDARDS-2026'], 'The journey begins when a physical suitcase receives a digital identity. The tag links the bag to an itinerary and carries a standardized license-plate number. From this point forward, the system is not only moving luggage. It is maintaining a relationship between an object and a record.'),
    scene('HSL2_005', 'CH01', 'A suitcase becomes data', 'explain_data_record', 'remotion', 'A ten-digit bag identity expands into passenger itinerary, origin, transfer and destination routing fields', ['IATA-BAGGAGE-STANDARDS-2026'], 'The printed tag is the visible part. Behind it sits routing information that tells handling systems which flights and destinations belong to the bag. The label can be scratched or folded; the data can be incomplete or late. Reliability begins by keeping both representations connected.'),
    scene('HSL2_006', 'CH01', 'A suitcase becomes data', 'show_first_scan', 'generated_ai', 'Macro cinematic reconstruction of a suitcase barcode passing beneath a fixed scanner as a clean identity pulse appears', [], 'At induction, a scanner attempts to identify the bag before a conveyor commits it to a route. A successful read lets software connect the moving object to the planned journey. A failed read creates uncertainty, and uncertainty usually sends the bag toward another decision point.', 'invisible_process'),
    scene('HSL2_007', 'CH01', 'A suitcase becomes data', 'explain_screening', 'remotion', 'A checked bag moves through three bounded screening states: automated detection, image review and manual resolution', ['TSA-CHECKED-BAGGAGE-ROADMAP-2025'], 'In the United States, checked baggage screening can involve automated explosives detection, image review for alarms, and manual inspection when an alarm cannot be resolved. Security is not a decorative checkpoint. It is a required branch that can return the bag to flow or hold it for resolution.'),
    scene('HSL2_008', 'CH01', 'A suitcase becomes data', 'show_exception_branch', 'remotion', 'Main conveyor continues while an unreadable, oversize or unresolved bag diverts into staffed exception handling', ['TSA-CHECKED-BAGGAGE-ROADMAP-2025', 'IATA-R753-IMPLEMENTATION-GUIDE-2023-I4'], 'Not every suitcase fits the automated path. Oversize items, unreadable tags, unresolved screening alarms, and other exceptions can leave the main flow. The system remains reliable only if these branches preserve identity and return cleared bags to the correct journey.'),
    scene('HSL2_009', 'CH01', 'A suitcase becomes data', 'state_tracking_contract', 'remotion', 'Four tracking anchors appear around one bag: acceptance, aircraft load, transfer and passenger delivery', ['IATA-BAGGAGE-TRACKING-2026'], 'IATA Resolution 753 defines four core tracking points: acceptance from the passenger, loading onto an aircraft, transfer delivery or acquisition, and final return to the passenger. These events do not show every meter traveled. They create an audit trail across the moments where responsibility changes.'),
    scene('HSL2_010', 'CH01', 'A suitcase becomes data', 'chapter_reframe', 'typography', 'A BAG IS AN OBJECT AND A PROMISE', [], 'The suitcase is physical, but the promise is informational: this identity should be at this place before this deadline. The machinery can move thousands of objects. The harder task is making sure each object keeps the correct promise while the airport changes around it.'),

    scene('HSL2_011', 'CH02', 'Building the first journey', 'enter_bhs', 'generated_ai', 'Wide cutaway reconstruction beneath an airport terminal reveals multiple baggage conveyors merging into a hidden mechanical network', [], 'Beyond the check-in hall, separate input belts merge into the baggage handling system. What looked like one conveyor becomes a network of junctions, inclines, scanners, screening machines, storage positions, and staffed work areas hidden behind walls and below passenger floors.', 'scale'),
    scene('HSL2_012', 'CH02', 'Building the first journey', 'explain_sortation', 'remotion', 'One identified suitcase moves through a branching sortation graph toward a flight-specific make-up position', ['IATA-R753-IMPLEMENTATION-GUIDE-2023-I4'], 'Sortation converts itinerary data into physical direction. At each controlled branch, the system needs enough confidence to send the bag onward. A fast belt is useful, but speed without a correct destination only moves an error farther through the airport.'),
    scene('HSL2_013', 'CH02', 'Building the first journey', 'show_scale', 'licensed_real', 'Real wide footage of a large airport baggage hall with dense parallel conveyors and bags moving in both directions', ['HEATHROW-BAGGAGE-SYSTEM-2023'], 'At a major hub, this happens at industrial scale. Heathrow says its systems scan and sort up to 140,000 departing bags in a day. That number is not a template for every airport. It demonstrates why baggage handling is infrastructure rather than a longer version of the carousel.'),
    scene('HSL2_014', 'CH02', 'Building the first journey', 'explain_staging', 'remotion', 'Early, on-time and late bags occupy different time windows before converging on one flight make-up area', [], 'Bags do not all arrive at the loading area together. Some enter early and need to wait. Others arrive near the working deadline. The system must absorb these different rhythms, then assemble the correct set for one flight without mixing it with the departures beside it.'),
    scene('HSL2_015', 'CH02', 'Building the first journey', 'show_reconciliation', 'remotion', 'Bag identities are checked against one aircraft assignment before the physical load is confirmed', ['IATA-BAGGAGE-TRACKING-2026'], 'Before loading, baggage reconciliation connects the planned passenger journey, the bag identity, and the aircraft assignment. This does not mean every airport uses identical hardware. It means the final physical handoff needs a trustworthy answer to a simple question: does this bag belong on this departure?'),
    scene('HSL2_016', 'CH02', 'Building the first journey', 'show_human_loading', 'licensed_real', 'Ground handlers use belt-loading equipment to move checked bags into a narrow-body aircraft hold', ['UK-HSE-BAGGAGE-HANDLING-2025'], 'Automation ends at physical edges. Ground handlers still move, position, and stack bags, especially inside aircraft holds. Mechanical loaders reduce parts of that effort, but the final arrangement remains a human and equipment task performed inside a turnaround that is already counting down.'),
    scene('HSL2_017', 'CH02', 'Building the first journey', 'record_first_load', 'remotion', 'The first-aircraft loading scan closes one custody segment and activates the transfer plan ahead', ['IATA-BAGGAGE-TRACKING-2026'], 'The loading event creates another confirmed point in the record. The bag is no longer merely somewhere inside the airport. It has been assigned to a physical aircraft. For a connecting itinerary, that confirmation also tells the next airport what should soon arrive.'),
    scene('HSL2_018', 'CH02', 'Building the first journey', 'depart_origin', 'generated_ai', 'Cargo hold closes beneath a departing airliner while a subtle route line continues toward the transfer hub', [], 'The first flight leaves with the passenger and bag together. For a direct trip, the next major handoff may be arrival delivery. For a connection, the aircraft is carrying both into a second deadline that began before the wheels ever touched the ground.', 'transition'),

    scene('HSL2_019', 'CH03', 'The transfer clock', 'arrive_hub', 'licensed_real', 'An arriving aircraft reaches a busy hub stand as baggage crews position carts and belt loaders', ['UK-HSE-BAGGAGE-HANDLING-2025'], 'At the hub, the passenger sees an arrival gate. The bag reaches an aircraft hold that must be opened, unloaded, and divided by destination. The transfer clock is already running, but the suitcase cannot read signs or choose a shorter corridor.'),
    scene('HSL2_020', 'CH03', 'The transfer clock', 'separate_transfer_flow', 'remotion', 'Local bags move toward reclaim while connecting bags branch toward a transfer induction point', ['IATA-BAGGAGE-TRACKING-2026'], 'Local bags and transfer bags need different outcomes. One group moves toward passenger reclaim. The other must re-enter a departure process. Separating them correctly is the first transfer decision, because a bag sent to the wrong branch can lose time even while remaining inside the same airport.'),
    scene('HSL2_021', 'CH03', 'The transfer clock', 'record_transfer', 'remotion', 'A custody marker updates when the suitcase reaches the transfer area and is acquired for the next segment', ['IATA-BAGGAGE-TRACKING-2026'], 'Resolution 753 includes transfer delivery or acquisition because a connection can cross operational boundaries. The next airline, airport system, or handling team needs evidence that the bag reached the agreed transfer point. Physical custody and digital visibility must change together.'),
    scene('HSL2_022', 'CH03', 'The transfer clock', 'update_route', 'remotion', 'The original route segment closes and a new flight, pier and make-up destination activate for the same bag identity', ['IATA-BAGGAGE-STANDARDS-2026'], 'The identity remains the same, but the active instruction changes. Transfer messages and shared baggage data allow the next handling process to understand the onward flight. The bag is not following a painted line. It is repeatedly receiving a new physical destination from its record.'),
    scene('HSL2_023', 'CH03', 'The transfer clock', 'show_distance', 'generated_ai', 'Top-down airport cutaway shows a suitcase route crossing tunnels, transfer conveyors and a distant satellite terminal', [], 'At some hubs, the next aircraft may be nearby. At others, the route crosses terminals, tunnels, transfer facilities, or apron roads. A short passenger connection can still contain a long baggage journey because the two networks are designed around different access, security, and handling constraints.', 'scale'),
    scene('HSL2_024', 'CH03', 'The transfer clock', 'build_deadline', 'remotion', 'A transfer clock subtracts unloading, identification, transport, sortation, reconciliation and final loading windows', [], 'Connection time is not one open block. Unloading consumes part of it. Identification and transfer consume more. Sortation, reconciliation, transport to the aircraft, and loading each need their own window. The useful margin is what remains after every required step takes its share.'),
    scene('HSL2_025', 'CH03', 'The transfer clock', 'prioritize_hot_bag', 'remotion', 'A late yellow suitcase receives priority while multiple normal transfer flows continue around it', ['IATA-BAGGAGE-TRACKING-2026'], 'Tracking data can help operators identify hot connections: bags with little time remaining. Priority can move one suitcase ahead of routine flow, but it cannot erase distance, reopen a closed load, or create unlimited staff and vehicles. Priority changes sequence, not physics.'),
    scene('HSL2_026', 'CH03', 'The transfer clock', 'compare_deadlines', 'remotion', 'Three bags for the same outbound flight show different remaining time because they arrived on different inbound aircraft', [], 'Even bags headed to the same aircraft can have different deadlines. One may have waited inside the airport. Another may be arriving from a delayed flight. The destination is shared, but urgency belongs to the individual journey. That makes transfer baggage a live scheduling problem.'),
    scene('HSL2_027', 'CH03', 'The transfer clock', 'reveal_constraint', 'typography', 'THE BOTTLENECK IS TIME WITH STEPS LEFT', [], 'The real constraint is not simply conveyor speed. It is remaining time multiplied by unfinished work. A bag can be physically close to the aircraft and still be operationally far away if its identity, screening status, custody, or loading instruction is unresolved.'),

    scene('HSL2_028', 'CH04', 'The missed connection', 'trigger_delay', 'generated_ai', 'Inbound airliner parks late at night while a transfer countdown shifts from yellow to orange beneath the terminal', [], 'Now delay the inbound flight. Nothing dramatic has to break. Weather, congestion, a late gate, or another operational constraint can remove the margin before baggage crews touch the hold. The suitcase arrives inside a system whose original plan may already be impossible.', 'reconstruction'),
    scene('HSL2_029', 'CH04', 'The missed connection', 'compare_passenger_bag', 'remotion', 'Passenger route collapses to one direct corridor while the bag route retains every operational checkpoint', [], 'The passenger can be told to run directly to a gate. The suitcase cannot make the same shortcut. It still needs a physical unload, a correct identity, a transfer route, a loading position, and a confirmed handoff. This is how the passenger can make a flight that the bag misses.'),
    scene('HSL2_030', 'CH04', 'The missed connection', 'miss_sort_window', 'remotion', 'The outbound make-up window closes just before the yellow suitcase reaches the final merge', [], 'At some point, the outbound process stops accepting normal additions. The exact rule varies, but the principle is consistent: loading must finish in time for the aircraft to close and depart safely. Once that window disappears, speed alone cannot restore the original journey.'),
    scene('HSL2_031', 'CH04', 'The missed connection', 'create_exception', 'remotion', 'The suitcase leaves the normal route and enters an exception queue with last scan, intended flight and current status', ['IATA-R753-IMPLEMENTATION-GUIDE-2023-I4'], 'The bag now becomes an exception. That does not mean the system knows nothing. It may know the last confirmed scan, the intended flight, the current custodian, and the location where normal routing stopped. Recovery begins by converting those fragments into a new executable plan.'),
    scene('HSL2_032', 'CH04', 'The missed connection', 'avoid_wrong_load', 'remotion', 'A reconciliation gate blocks the old aircraft assignment after the connection becomes invalid', ['IATA-BAGGAGE-TRACKING-2026'], 'A missed connection creates pressure to move quickly, but the next movement still has to be correct. Reconciliation and tracking help prevent an outdated instruction from sending the bag into another wrong handoff. The system must stop trusting the old plan before it can build a new one.'),
    scene('HSL2_033', 'CH04', 'The missed connection', 'identify_next_flight', 'remotion', 'Candidate flights appear by destination, carrier, capacity and departure time before one new route is selected', ['IATA-R753-IMPLEMENTATION-GUIDE-2023-I4'], 'In most cases, a mishandled bag is assigned to another flight and reinserted into the normal departure process. But another flight is not merely a matching city name. The operating carrier, available route, handling agreements, timing, and destination recovery capability all matter.'),
    scene('HSL2_034', 'CH04', 'The missed connection', 'same_carrier_reflight', 'remotion', 'Same-carrier reflight preserves original acceptance and creates a new aircraft loading requirement', ['IATA-R753-IMPLEMENTATION-GUIDE-2023-I4'], 'If the original carrier keeps custody, the initial passenger acceptance still applies. The bag receives a new flight assignment, and its loading onto that new aircraft must be recorded. The exception journey reuses the original identity while replacing the segment that failed.'),
    scene('HSL2_035', 'CH04', 'The missed connection', 'interline_handoff', 'remotion', 'Different-carrier recovery adds an agreed physical exchange point and a new custody event', ['IATA-R753-IMPLEMENTATION-GUIDE-2023-I4'], 'If another carrier will transport the bag, the recovery path adds a custody exchange. The physical handoff or delivery to an agreed transfer point should be recorded. A new route therefore creates not only movement, but another organization that must recognize and continue the same promise.'),
    scene('HSL2_036', 'CH04', 'The missed connection', 'departure_without_bag', 'generated_ai', 'Aircraft pushes back while one clearly identified suitcase remains safely inside a controlled airport exception area', [], 'The outbound aircraft leaves. From the passenger seat, the outcome is already visible only as uncertainty. Inside the airport, the bag is no longer racing that departure. It is waiting for a route that can still be completed and proven.', 'atmosphere'),

    scene('HSL2_037', 'CH05', 'Building a second journey', 'trace_last_handoff', 'remotion', 'A timeline reconstructs acceptance, first load, transfer acquisition and the final confirmed scan before failure', ['IATA-BAGGAGE-TRACKING-2026'], 'Recovery starts with the audit trail. Acceptance confirms the bag entered the journey. Loading confirms the first aircraft. Transfer tracking confirms whether it reached the hub process. The last reliable event narrows the search and tells operators which part of the network should act next.'),
    scene('HSL2_038', 'CH05', 'Building a second journey', 'explain_visibility_gap', 'remotion', 'Known tracking points remain solid while the unobserved space between them becomes a bounded search zone', [], 'Tracking does not create a live camera on every suitcase. It creates verified anchors. The space between two anchors can still contain uncertainty, but it is smaller than an airport. Better event quality shortens the distance between “we do not know” and a useful operational search.'),
    scene('HSL2_039', 'CH05', 'Building a second journey', 'send_reflight_message', 'remotion', 'A reflight message replaces the failed segment and distributes the new instruction to handling partners', ['IATA-BAGGAGE-STANDARDS-2026'], 'Standard baggage systems include reflight messaging so a changed assignment can move through the operational network. The physical suitcase may remain still while its future route changes in several databases. Only after the new instruction reaches the right handlers can movement resume.'),
    scene('HSL2_040', 'CH05', 'Building a second journey', 'reinsert_normal_flow', 'generated_ai', 'A yellow suitcase leaves a staffed exception station and merges cleanly into a new outbound conveyor flow', ['IATA-R753-IMPLEMENTATION-GUIDE-2023-I4'], 'Once the route is ready, the bag is reinserted into the normal departure process. It must again be identified, sorted, delivered to the new flight, and recorded at loading. Recovery succeeds by making an abnormal journey compatible with the same controls used for an ordinary bag.', 'invisible_process'),
    scene('HSL2_041', 'CH05', 'Building a second journey', 'load_reflight', 'licensed_real', 'Documentary footage of a late suitcase being scanned and loaded onto a departing aircraft baggage belt', ['IATA-R753-IMPLEMENTATION-GUIDE-2023-I4'], 'The new loading event is more than good news. It proves the recovery plan reached an aircraft. Until that moment, the bag may have an itinerary without transport. The second journey becomes real only when information and physical custody meet again at the aircraft.'),
    scene('HSL2_042', 'CH05', 'Building a second journey', 'arrive_after_passenger', 'remotion', 'Passenger arrival completes first while the delayed suitcase follows on a later aircraft and enters destination handling', [], 'The passenger and suitcase now arrive on different schedules. At the destination, the bag cannot simply be placed on a carousel hours later and left to chance. Its delayed status changes the final handoff and the work required to complete the original promise.'),
    scene('HSL2_043', 'CH05', 'Building a second journey', 'deliver_last_mile', 'remotion', 'Destination baggage desk hands the delayed bag to a courier route ending at a home or hotel', ['IATA-R753-IMPLEMENTATION-GUIDE-2023-I4'], 'A mishandled bag may be returned at a home or hotel instead of an arrival belt. Resolution 753 guidance treats that delivery as a tracking event too. The journey ends only when custody returns to the passenger, even if the airport portion finished much earlier.'),
    scene('HSL2_044', 'CH05', 'Building a second journey', 'chapter_reframe', 'typography', 'DELAYED IS A ROUTE. LOST IS AN UNKNOWN.', [], 'A delayed bag with a confirmed identity and a new route is an operational problem. A bag with no trustworthy location or broken identity is a search problem. Passengers experience both as absence, but the system needs very different information to resolve them.'),

    scene('HSL2_045', 'CH06', 'Why transfers fail', 'show_industry_pattern', 'remotion', 'Industry mishandling causes form a chart with transfers highlighted as the largest category in the 2025 dataset', ['SITA-BAGGAGE-INSIGHTS-2026'], 'This vulnerability appears across the industry. In SITA’s 2025 dataset, transfers remained the largest driver of baggage mishandling, at 39 percent of cases. The figure is an industry estimate, but the mechanism is clear: every connection adds deadlines, custody changes, and another opportunity for data and movement to separate.'),
    scene('HSL2_046', 'CH06', 'Why transfers fail', 'propagate_disruption', 'remotion', 'Several delayed inbound flights feed a growing exception queue while outbound departures continue', [], 'One missed bag is manageable. A wave of late inbound flights creates many urgent bags at once. The same exception desks, vehicles, scanners, sorters, and handlers now face concentrated demand. A delay that began in the flight network becomes a baggage-capacity problem on the ground.'),
    scene('HSL2_047', 'CH06', 'Why transfers fail', 'show_shared_capacity', 'remotion', 'Normal bags, hot connections and reflight bags compete for shared conveyors, staff and aircraft loading windows', [], 'Recovery does not operate in an empty airport. Reflight bags share infrastructure with normal departures and other hot connections. Giving one bag priority may consume capacity elsewhere. The system is continuously deciding which work can still meet a useful deadline.'),
    scene('HSL2_048', 'CH06', 'Why transfers fail', 'explain_data_quality', 'remotion', 'A correct scan creates a continuous route while a missing event expands uncertainty across several possible locations', ['IATA-BAGGAGE-TRACKING-2026'], 'A conveyor moves the bag, but data determines whether the next team knows what happened. Missing, late, or unshared events widen the search. Accurate tracking does not prevent every missed connection. It makes the failure visible earlier and gives recovery a smaller problem to solve.'),
    scene('HSL2_049', 'CH06', 'Why transfers fail', 'explain_collaboration', 'remotion', 'Airline, airport and ground handler connect around one shared bag identity and custody timeline', ['IATA-BAGGAGE-TRACKING-2026', 'SITA-BAGGAGE-INSIGHTS-2026'], 'No single organization controls the entire journey. Airports may operate core systems. Airlines own the passenger promise and routing decisions. Ground handlers perform many physical transfers. Reliability emerges only when these parties exchange usable information at the same moments custody changes.'),
    scene('HSL2_050', 'CH06', 'Why transfers fail', 'show_physical_resilience', 'generated_ai', 'A baggage control room reroutes yellow bag flows around one stopped conveyor while blue infrastructure remains visible', [], 'Physical resilience provides alternate belts, routes, work areas, and procedures around a failure. But an alternate path helps only if the bag can be identified, directed, staffed, and delivered before the remaining window closes. Redundancy is operational, not merely architectural.', 'reconstruction'),
    scene('HSL2_051', 'CH06', 'Why transfers fail', 'state_limitation', 'typography', 'NO TWO CONNECTIONS HAVE THE SAME BAGGAGE MAP', ['IATA-R753-IMPLEMENTATION-GUIDE-2023-I4', 'TSA-CHECKED-BAGGAGE-ROADMAP-2025'], 'Security rules, terminal layouts, carrier agreements, aircraft loading methods, and local procedures vary. A small airport may rely on direct manual movement. A hub may use kilometers of automated handling. The shared principle is not one machine. It is preserving identity through every required handoff.'),

    scene('HSL2_052', 'CONCLUSION', 'Run the journey again', 'reverse_map', 'remotion', 'The complete split map resets at bag drop and runs forward through the successful first flight', [], 'Run the journey again. The passenger hands over a suitcase. A tag gives it an identity. Screening clears it. Sortation converts the itinerary into a physical route. Reconciliation and loading connect it to the first aircraft. Every step keeps object, record, and deadline aligned.'),
    scene('HSL2_053', 'CONCLUSION', 'Run the journey again', 'complete_transfer', 'remotion', 'At the hub the passenger and bag routes separate, then reconnect at the outbound aircraft before the clock expires', [], 'At the hub, the routes separate. The passenger crosses the terminal. The suitcase passes through unloading, transfer tracking, new sortation, and another load. When both reach the outbound flight in time, the complexity disappears behind an ordinary arrival carousel.'),
    scene('HSL2_054', 'CONCLUSION', 'Run the journey again', 'complete_recovery', 'generated_ai', 'A delayed suitcase completes a later route and is handed to its owner at a hotel entrance without showing a real airline brand', [], 'When the bag misses, the system preserves what it can: identity, last location, custody, and destination. It replaces the failed segment, records the new load, and creates a final delivery outside the original schedule. Recovery is a second journey built from the evidence left by the first.', 'transition'),
    scene('HSL2_055', 'CONCLUSION', 'The hidden product', 'deliver_payoff', 'remotion', 'Suitcase, identity record, custody chain and transfer clock lock together as four synchronized layers', [], 'That is the answer to the opening puzzle. A passenger can make the connection while a bag misses it because they do not travel through the same system. The bag succeeds only when its location, identity, custody, and remaining time continue to describe the same journey.'),
    scene('HSL2_056', 'CONCLUSION', 'The hidden product', 'conclusion', 'typography', 'THE VISIBLE OBJECT IS A SUITCASE. THE HIDDEN PRODUCT IS AGREEMENT.', [], 'The next time a suitcase appears on a carousel, the visible achievement is simple: one object reached one place. The hidden achievement is that dozens of machines, messages, and people agreed about which object, which place, and which moment all the way there.')
  ],
  human_approval_status: 'APPROVED'
};
