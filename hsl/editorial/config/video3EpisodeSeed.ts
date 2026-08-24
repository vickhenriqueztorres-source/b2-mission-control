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

export const HSL_VIDEO_3_EPISODE_SEED: HslEpisodeSeed = {
  episode_id: 'HSL-VIDEO-003',
  title: 'The Hidden Journey of Water to Your Tap',
  format: 'THE_JOURNEY',
  target_duration_minutes: 15,
  central_question: 'What has to happen inside a city water system before clean water can appear instantly at a household tap?',
  thesis: 'Tap water feels instant because a city quietly keeps source water, treatment chemistry, storage volume, distribution pressure and pipe integrity aligned before the faucet opens.',
  object_or_flow: 'One gallon of drinking water moving from source intake through treatment, finished-water storage, pumps, pressure zones, buried mains, service lines and household plumbing',
  system_being_analyzed: 'Municipal drinking-water treatment and distribution systems, including source protection, treatment barriers, finished-water storage, pumping, pressure management, disinfection residuals, main breaks and customer delivery',
  main_constraint: 'The system must deliver safe water under adequate positive pressure while demand changes by hour, elevation, pipe condition, emergencies and distance from the treatment plant',
  primary_consequence: 'When pressure, treatment, storage or pipe integrity fails, a single break or pump outage can turn an ordinary neighborhood into an advisory zone with low pressure, outages or water that must be boiled before use',
  hero_visual: 'A cinematic underground cutaway follows a glowing blue water path from reservoir to treatment plant, tower, pressure zone and kitchen tap, while yellow pulses show active flow and orange warnings reveal where failures can spread.',
  causal_flow: ['source_intake', 'raw_water_pumping', 'treatment_barriers', 'finished_water_storage', 'pressure_zones', 'distribution_mains', 'service_line', 'household_tap', 'failure_response'],
  system_interfaces: ['intake_screen', 'coagulation_basin', 'filter_bed', 'disinfection_contact', 'storage_tank', 'pump_station', 'pressure_regulating_valve', 'water_main', 'service_connection'],
  original_interpretation: 'The visible product is water. The hidden product is controlled pressure around a public-health promise.',
  counterargument_or_limitation: 'Water systems vary by source, geology, utility size, treatment train, state rules, pipe age, pressure zones and private plumbing; this episode explains a representative public water system rather than one universal city.',
  audience_strategy: {
    primary_audience: 'People who use tap water every day and have rarely seen the hidden infrastructure that makes it reliable',
    awareness_level: 1,
    sophistication_level: 2,
    what_they_know: 'Water comes from a utility, a reservoir or a well, and it should be safe when it reaches the faucet',
    knowledge_gap: 'The faucet is only the last visible inch of a system that has to treat, store, pressurize and protect water continuously',
    mass_desire: 'Reveal the invisible public system behind one ordinary household action',
    human_conflict: 'A family expects instant clean water, while the utility must keep chemistry, pumps, tanks, old pipes and emergency response working before anyone opens a tap',
    thumbnail_text: 'BEFORE THE TAP',
    title_candidates: [
      'The Hidden Journey of Water to Your Tap',
      'Why Clean Tap Water Is an Invisible Engineering Race'
    ],
    next_video_question: 'What happens underground when a sewer system backs up during a storm?'
  },
  sources: [
    {
      source_id: 'EPA-PUBLIC-WATER-SYSTEMS-2026',
      category: 'primary',
      url: 'https://www.epa.gov/dwreginfo/information-about-public-water-systems',
      accessed_at: '2026-08-22',
      claims: [
        'EPA says public drinking-water systems regulated by EPA and delegated states and tribes provide drinking water to 90 percent of Americans.',
        'A public water system provides water for human consumption through pipes or other constructed conveyances to at least 15 service connections or an average of at least 25 people for at least 60 days a year.',
        'EPA identifies more than 148,000 public water systems in the United States and classifies them by population served, source water and customer pattern.'
      ],
      limitations: ['The page defines U.S. public water systems and does not describe every local treatment or distribution layout.']
    },
    {
      source_id: 'CDC-DRINKING-WATER-ABOUT-2025',
      category: 'primary',
      url: 'https://www.cdc.gov/drinking-water/about/index.html',
      accessed_at: '2026-08-22',
      claims: [
        'CDC says the quality of drinking water depends on where it came from and how it has been treated.',
        'CDC says most U.S. tap water comes from reservoirs, lakes, rivers or groundwater pumped from wells.',
        'CDC says harmful germs and chemicals can enter drinking water at the source or while water is piped to homes and businesses.',
        'CDC says utilities that serve public systems must notify customers if water quality does not meet EPA standards.'
      ],
      limitations: ['The CDC overview is public-health guidance and does not specify hydraulic design rules for individual systems.']
    },
    {
      source_id: 'CDC-WATER-TREATMENT-WORKS-2024',
      category: 'technical',
      url: 'https://www.cdc.gov/drinking-water/about/how-water-treatment-works.html',
      accessed_at: '2026-08-22',
      claims: [
        'CDC describes common treatment steps as coagulation, flocculation, sedimentation, filtration and disinfection.',
        'CDC says filters made from materials such as sand, gravel or charcoal remove germs and dissolved particles.',
        'CDC says remaining chemical disinfectant can continue killing germs in pipes between the treatment plant and the tap.',
        'CDC says utilities choose treatment steps based on the quality of the source water entering the plant.'
      ],
      limitations: ['The sequence is a common treatment model; utilities can use different or additional processes.']
    },
    {
      source_id: 'EPA-DISTRIBUTION-SYSTEMS-2025',
      category: 'technical',
      url: 'https://www.epa.gov/dwreginfo/drinking-water-distribution-system-tools-and-resources',
      accessed_at: '2026-08-22',
      claims: [
        'EPA describes drinking-water distribution systems as networks of pipes, storage facilities, valves and pumps that connect treatment plants or sources to customers.',
        'EPA says distribution systems provide domestic water and may also supply fire protection, agricultural and commercial uses.',
        'EPA says distribution systems are the vast majority of physical water-system infrastructure and serve as the final barrier against contamination.',
        'EPA says pressure monitoring and management are integral to proper distribution-system operation.',
        'EPA says water age can indicate delivered drinking-water quality because disinfectant residual can decrease as water spends more time in the system.',
        'EPA says finished-water storage facilities include tanks, standpipes and reservoirs used to store water that does not undergo further treatment.'
      ],
      limitations: ['The page collects tools and resources and should be used as system guidance rather than a local engineering design manual.']
    },
    {
      source_id: 'EPA-DRINKING-WATER-REGULATIONS-2026',
      category: 'primary',
      url: 'https://www.epa.gov/dwreginfo/drinking-water-regulations',
      accessed_at: '2026-08-22',
      claims: [
        'EPA sets legal limits on more than 90 contaminants in drinking water.',
        'EPA rules also set water-testing schedules and methods that water systems must follow.',
        'The Safe Drinking Water Act lets states set and enforce their own drinking-water standards if they are at least as stringent as EPA national standards.'
      ],
      limitations: ['The regulations overview is not a full list of every contaminant rule or monitoring requirement.']
    },
    {
      source_id: 'EPA-LOSS-OF-PRESSURE-2026',
      category: 'technical',
      url: 'https://www.epa.gov/region8-waterops/loss-pressure-drinking-water-systems-wyoming-and-tribal-lands-epa-region-8',
      accessed_at: '2026-08-22',
      claims: [
        'EPA says distribution systems can lose pressure due to water main breaks, equipment failures, loss of power and similar events.',
        'EPA says loss of pressure may cause water from outside the pipe to move into the pipe through cracks, breaks or joints.',
        'EPA says backsiphonage can occur under low or no pressure conditions.'
      ],
      limitations: ['The page is region-specific operational guidance, but the pressure-loss mechanism is broadly relevant to distribution systems.']
    },
    {
      source_id: 'CDC-DRINKING-WATER-ADVISORIES-2026',
      category: 'primary',
      url: 'https://www.cdc.gov/water-emergency/about/drinking-water-advisories-an-overview.html',
      accessed_at: '2026-08-22',
      claims: [
        'CDC says a boil water advisory tells people to use commercially bottled water or boil tap water.',
        'CDC says advisories can include different instructions for drinking, cooking, infant formula and handwashing depending on local guidance.',
        'CDC advises following local officials during a drinking-water advisory.'
      ],
      limitations: ['The CDC advisory page explains user actions and does not identify every trigger used by every jurisdiction.']
    },
    {
      source_id: 'ASCE-DRINKING-WATER-INFRASTRUCTURE-2025',
      category: 'independent',
      url: 'https://infrastructurereportcard.org/cat-item/drinking-water-infrastructure/',
      accessed_at: '2026-08-22',
      claims: [
        'ASCE says U.S. drinking-water infrastructure includes more than 2 million miles of underground transmission and distribution lines.',
        'ASCE says some of the oldest pipes were laid in the 19th century and many post-World War II pipe segments have reached or are reaching the end of their design life.',
        'ASCE cites EPA needs-assessment figures showing major long-term drinking-water infrastructure investment needs.'
      ],
      limitations: ['ASCE is an infrastructure advocacy and professional organization source, not a regulator or a local utility inventory.']
    }
  ],
  scenes: [
    scene('HSL3_001', 'HOOK', 'Before the tap', 'introduce_puzzle', 'generated_ai', 'A quiet kitchen faucet opens at night while the camera dives through the wall into a glowing underground city water network', [], 'You turn a handle, and clean water appears as if it had been waiting inside the faucet. But the faucet is not where the journey begins. It is the last visible inch of a system that has already found the water, cleaned it, stored it, pushed it, protected it, and kept it under pressure before you arrived.', 'scale'),
    scene('HSL3_002', 'HOOK', 'Before the tap', 'early_evidence', 'remotion', 'Source, treatment, storage, pressure and pipe integrity align before one tap opens', ['EPA-DISTRIBUTION-SYSTEMS-2025', 'CDC-WATER-TREATMENT-WORKS-2024'], 'A public water system is not just a pipe. It is a chain of conditions. The source must be available. The treatment must match the raw water. Storage must hold enough volume. Pumps and tanks must maintain pressure. Buried mains must remain sealed. Break one condition, and the same faucet can become slow, dry, cloudy, or unsafe.'),
    scene('HSL3_003', 'HOOK', 'Before the tap', 'open_question', 'typography', 'THE WATER IS VISIBLE. THE PRESSURE IS HIDDEN.', [], 'So this episode follows one gallon before it reaches a home. Not because the gallon is special, but because every ordinary glass of water is a successful handoff between chemistry, machinery, geography, and public health. The hidden question is simple: what has to stay true before the tap can be trusted?'),

    scene('HSL3_004', 'CH01', 'Finding the source', 'establish_sources', 'licensed_real', 'Documentary aerial footage of reservoirs, rivers and municipal wells feeding a treatment system', ['CDC-DRINKING-WATER-ABOUT-2025'], 'The first decision is where the water comes from. In the United States, CDC describes common sources as reservoirs, lakes, rivers, and groundwater pumped from wells. A river brings a different problem than an aquifer. A reservoir changes with storms, drought and algae. A well depends on geology and protection below the surface.'),
    scene('HSL3_005', 'CH01', 'Finding the source', 'compare_source_quality', 'remotion', 'Surface water and groundwater split into different risk profiles and treatment demands', ['CDC-WATER-TREATMENT-WORKS-2024'], 'Source water is not a blank ingredient. It arrives with sediment, organic matter, minerals, seasonal temperature, possible germs, and local chemical risks. CDC notes that different utilities use different treatment steps depending on source-water quality. The plant is therefore not cleaning an abstract liquid. It is solving the specific water it receives.'),
    scene('HSL3_006', 'CH01', 'Finding the source', 'show_intake', 'generated_ai', 'Cinematic intake structure below a reservoir pulls raw water through screens toward a treatment plant at dawn', [], 'At the intake, the public system begins turning a natural source into an engineered flow. Screens keep out debris. Gates and pumps control how much water enters. The goal is not simply to grab water. It is to admit a usable flow into a process that can handle it before demand rises somewhere else.', 'invisible_process'),
    scene('HSL3_007', 'CH01', 'Finding the source', 'explain_private_boundary', 'remotion', 'Public water system boundary compares utility-served customers with a private well outside the regulated chain', ['EPA-PUBLIC-WATER-SYSTEMS-2026', 'CDC-DRINKING-WATER-ABOUT-2025'], 'EPA defines public water systems by constructed conveyances, service connections, and population served. CDC also reminds well owners that private wells are different: the owner is responsible for making that water safe. This episode is mainly about the public utility chain, where responsibility is shared across operators, regulators, pipes and customers.'),
    scene('HSL3_008', 'CH01', 'Finding the source', 'show_raw_water_risk', 'generated_ai', 'Rain hits a watershed and runoff traces faint orange paths toward a reservoir intake before fading into monitoring points', [], 'The source is outside the plant, which means the plant inherits what happens upstream. Rain can stir sediment. Warm weather can change biology. Land use can introduce chemicals. Protecting source water reduces risk before treatment ever starts, but the utility still has to assume that raw water will change.', 'reconstruction'),
    scene('HSL3_009', 'CH01', 'Finding the source', 'state_first_constraint', 'typography', 'THE SOURCE SETS THE FIRST PROBLEM', [], 'The first hidden rule is that treatment begins before treatment. A clean-looking lake, a deep well, and a muddy river are not the same starting point. The source determines what the rest of the system must remove, control, or prove before the water is allowed to move forward.'),

    scene('HSL3_010', 'CH02', 'Making it safe', 'enter_treatment_plant', 'generated_ai', 'Wide cinematic cutaway of a drinking-water treatment plant with basins, filters and disinfectant contact chambers', [], 'Inside the treatment plant, water becomes a sequence. It does not become safe through one magic machine. It passes through barriers, and each barrier removes a different kind of uncertainty. The plant is designed so that dirt, particles, germs and chemistry do not all depend on one single point of success.', 'scale'),
    scene('HSL3_011', 'CH02', 'Making it safe', 'coagulation_flocculation', 'remotion', 'Small particles bind into larger floc as mixing basins move from raw water to visible clusters', ['CDC-WATER-TREATMENT-WORKS-2024'], 'CDC describes coagulation as a step where chemicals help dirt and small particles bind together. Then flocculation gently mixes the water so larger particles form. The idea is almost counterintuitive: to make invisible particles removable, the system first has to make them gather into something heavy enough to separate.'),
    scene('HSL3_012', 'CH02', 'Making it safe', 'sedimentation', 'generated_ai', 'Slow cinematic sedimentation basin where glowing particle clouds settle downward and clear water advances above', [], 'In sedimentation, gravity becomes part of the machine. Heavier floc settles toward the bottom, while clearer water continues above it. Nothing about this looks fast, but the slowness matters. The plant is buying clarity by giving particles time to fall out of the flow before the next barrier.', 'invisible_process'),
    scene('HSL3_013', 'CH02', 'Making it safe', 'filtration', 'generated_ai', 'Macro cutaway of water passing through layers of sand, gravel and carbon inside a filter bed', ['CDC-WATER-TREATMENT-WORKS-2024'], 'Filtration is where water moves through materials such as sand, gravel or charcoal. CDC says these filters can remove germs and dissolved particles, depending on the design. To the viewer, the filter is hidden under a surface of water. Inside the bed, the system is forcing the gallon through a maze of contact.', 'invisible_process'),
    scene('HSL3_014', 'CH02', 'Making it safe', 'disinfection', 'remotion', 'Disinfection contact time converts remaining microbial risk into a controlled outgoing residual', ['CDC-WATER-TREATMENT-WORKS-2024'], 'Disinfection is often the last treatment step. The plant may add chlorine, chloramine, chlorine dioxide, or use other methods in specific contexts. The important idea is not just killing germs inside the plant. A remaining chemical disinfectant can keep working as water travels through pipes toward the customer.'),
    scene('HSL3_015', 'CH02', 'Making it safe', 'regulatory_frame', 'remotion', 'EPA standards, testing schedules and contaminant categories appear as a quality gate before distribution', ['EPA-DRINKING-WATER-REGULATIONS-2026'], 'The plant is not only following engineering judgment. EPA sets legal limits on more than 90 contaminants and also sets testing schedules and methods. That means safe water is both a physical result and a documented result. The system has to deliver water and evidence about the water.'),
    scene('HSL3_016', 'CH02', 'Making it safe', 'show_finished_water', 'generated_ai', 'Finished water leaves a treatment plant through a blue-lit pipe gallery toward storage tanks', [], 'Once treated, the gallon becomes finished water. But finished does not mean delivered. It still has to survive distance, time, pipe walls, changing demand, and thousands of branch points. The next system is not about cleaning dirty water. It is about keeping clean water clean while moving it through a city.', 'transition'),
    scene('HSL3_017', 'CH02', 'Making it safe', 'chapter_reframe', 'typography', 'TREATMENT IS NOT A MOMENT. IT IS A CHAIN OF BARRIERS.', [], 'By now, the gallon has already passed through an intake, particles, settling, filters, disinfection and monitoring. The faucet has still not entered the story. That is the first major reveal: the water you see for two seconds may have been protected by hours of invisible process.'),

    scene('HSL3_018', 'CH03', 'Storage and pressure', 'introduce_storage', 'generated_ai', 'Finished-water storage tank at sunset with a cutaway showing volume above a network of blue pipes', ['EPA-DISTRIBUTION-SYSTEMS-2025'], 'Finished water often enters storage before it enters a home. EPA describes finished-water storage facilities as tanks, standpipes or reservoirs used to store water that does not undergo further treatment. Storage is not a pause in the story. It is the buffer that lets a city survive the difference between steady production and changing demand.', 'invisible_process'),
    scene('HSL3_019', 'CH03', 'Storage and pressure', 'explain_daily_demand', 'remotion', 'Morning, afternoon and night demand curves pull against treatment output and storage volume', [], 'Demand is uneven. A neighborhood wakes up, showers, cooks, flushes, irrigates and runs businesses on different clocks. The treatment plant may operate more steadily than the city consumes. Storage absorbs that mismatch, holding treated water when demand is lower and releasing it when people collectively act as if water is infinite.'),
    scene('HSL3_020', 'CH03', 'Storage and pressure', 'show_tower_pressure', 'generated_ai', 'Water tower and hillside pressure zone reveal gravity pushing blue flow through lower streets', [], 'Pressure is the reason the water moves when the faucet opens. In some places, elevation and towers help gravity do part of the work. In others, pumps are constantly building or supporting pressure. Either way, the system is not waiting for the tap. It is already holding the network in a ready state.', 'invisible_process'),
    scene('HSL3_021', 'CH03', 'Storage and pressure', 'pressure_management', 'remotion', 'Pressure zones, pumps and valves maintain minimum and maximum pressure across elevation changes', ['EPA-DISTRIBUTION-SYSTEMS-2025'], 'EPA describes pressure monitoring and management as integral to distribution-system operation. Too little pressure can create service and contamination risk. Too much pressure can stress pipes, waste water through leaks, and increase breaks. The target is controlled pressure, not maximum pressure.'),
    scene('HSL3_022', 'CH03', 'Storage and pressure', 'pump_station', 'generated_ai', 'Nighttime pump station interior with motors starting and blue flow pulses climbing toward a pressure zone', [], 'A pump station is where electricity becomes hydraulic confidence. Motors turn. Valves open. Sensors report pressure. The movement is mechanical, but the purpose is social: an apartment on a hill, a hydrant on a corner, and a kitchen at the end of a main all need usable pressure at the same time.', 'invisible_process'),
    scene('HSL3_023', 'CH03', 'Storage and pressure', 'water_age', 'remotion', 'Water age map shows fresh zones, slow zones and disinfectant residual gradually decreasing over time', ['EPA-DISTRIBUTION-SYSTEMS-2025', 'CDC-WATER-TREATMENT-WORKS-2024'], 'Water can also become old inside the system. EPA says water age can indicate delivered drinking-water quality, because disinfectant residual can decrease as water spends more time in distribution. The utility is therefore managing time as much as distance. A quiet dead end can be a hidden quality problem.'),
    scene('HSL3_024', 'CH03', 'Storage and pressure', 'storage_risk', 'remotion', 'Finished-water tank inspection highlights vents, hatches, roof gaps, sediment and biofilm risk areas', ['EPA-DISTRIBUTION-SYSTEMS-2025'], 'Storage protects supply, but it must also be protected. EPA notes sanitary risks around finished-water storage, including gaps, broken vent screens, sediment and biofilm buildup. A tank is not merely a container. It is another public-health boundary that needs inspection, cleaning and control.'),
    scene('HSL3_025', 'CH03', 'Storage and pressure', 'chapter_reframe', 'typography', 'THE CITY STORES WATER SO THE TAP FEELS INSTANT.', [], 'The tap feels immediate because the city has already paid the time cost somewhere else. It has treated water before demand, stored it before rush hour, and held pressure before the handle turns. Instant service is really stored preparation.'),

    scene('HSL3_026', 'CH04', 'Under the street', 'enter_distribution', 'generated_ai', 'Camera dives beneath a street into a dense network of water mains, valves, hydrants and service connections', ['EPA-DISTRIBUTION-SYSTEMS-2025'], 'After storage and pumping, the gallon enters the largest physical part of the system. EPA says distribution systems connect sources or treatment plants to customers through pipes, storage facilities, valves and pumps. Most of this network is underground, which is why reliability often looks like nothing is happening.', 'scale'),
    scene('HSL3_027', 'CH04', 'Under the street', 'show_network_branching', 'generated_ai', 'Top-down city map shows a main splitting into pressure zones, hydrants, service lines and homes', [], 'The network branches constantly. A large transmission main becomes smaller distribution mains. Those mains feed hydrants, commercial buildings, apartment towers and service lines. The same treated water is now part of a living graph, where closing one valve or breaking one pipe can redirect pressure somewhere else.', 'invisible_process'),
    scene('HSL3_028', 'CH04', 'Under the street', 'responsibility_boundary', 'remotion', 'Utility responsibility ends at the service connection while property-owner plumbing begins after the connection', ['EPA-DISTRIBUTION-SYSTEMS-2025'], 'EPA describes the public water system responsibility as extending from the entry point to the service connection, after which piping is generally the property owner responsibility. This boundary matters because the journey does not end at the city main. It crosses into a smaller private system before reaching the glass.'),
    scene('HSL3_029', 'CH04', 'Under the street', 'show_final_barrier', 'generated_ai', 'Blue water moves through an old cast-iron main while sensors and valves hold a protective pressure envelope', [], 'The distribution system is the final barrier, not a passive hallway. EPA says it must be operated and maintained to reduce risks from external contamination and internal sources such as microbial growth or corrosion. That means the buried pipe is part delivery route, part shield, and part aging asset.', 'invisible_process'),
    scene('HSL3_030', 'CH04', 'Under the street', 'scale_of_assets', 'remotion', 'Two million miles of underground drinking-water lines stretch across a dark U.S. map', ['ASCE-DRINKING-WATER-INFRASTRUCTURE-2025'], 'The scale is enormous. ASCE says U.S. drinking-water infrastructure includes more than 2 million miles of underground transmission and distribution lines. That is the real size of the promise behind a faucet: not one treatment plant, but a continent of buried connections aging at different speeds.'),
    scene('HSL3_031', 'CH04', 'Under the street', 'aging_pipe', 'generated_ai', 'Macro cinematic view of an aging pipe wall with corrosion texture while clean water continues moving inside', ['ASCE-DRINKING-WATER-INFRASTRUCTURE-2025'], 'Some pipes are old enough to belong to another century. ASCE notes that some of the oldest were laid in the 19th century, and many postwar segments are reaching or have reached the end of their design life. A system can deliver clean water today while quietly accumulating replacement debt underground.', 'invisible_process'),
    scene('HSL3_032', 'CH04', 'Under the street', 'corrosion_control', 'remotion', 'Pipe material, water chemistry and corrosion control align to reduce metal release and protect water quality', ['EPA-DISTRIBUTION-SYSTEMS-2025'], 'Water quality can change after treatment because pipe walls are not invisible to chemistry. EPA links corrosion to the release of metals such as lead and copper into water. That is why treatment can include pH adjustment and corrosion control. The journey is chemical even inside a quiet pipe.'),
    scene('HSL3_033', 'CH04', 'Under the street', 'approach_house', 'generated_ai', 'Service line leaves a buried main, crosses beneath a sidewalk and enters a house foundation toward a kitchen sink', [], 'Finally the gallon turns from public infrastructure toward a building. It passes the service connection, enters premise plumbing, moves through smaller pipes, and waits behind a closed valve. Only now does the faucet become relevant. Everything before this point was hidden work.', 'transition'),

    scene('HSL3_034', 'CH05', 'When pressure fails', 'trigger_main_break', 'generated_ai', 'Nighttime street main break sends water through asphalt while the pressure map turns orange around a neighborhood', ['EPA-LOSS-OF-PRESSURE-2026'], 'Now break one main. It can happen from age, ground movement, freezing, construction damage, pressure stress or other local causes. The visible event is water rising through pavement. The hidden event is a pressure zone losing the force that keeps flow moving outward and contaminants out.', 'reconstruction'),
    scene('HSL3_035', 'CH05', 'When pressure fails', 'loss_of_pressure', 'remotion', 'Positive pressure envelope collapses below safe threshold and outside water paths point toward pipe cracks', ['EPA-LOSS-OF-PRESSURE-2026'], 'EPA says distribution systems can lose pressure because of main breaks, equipment failures, power loss and similar events. It also warns that pressure loss may allow water outside the pipe to move inward through cracks, breaks or joints. That is why low pressure is not only an inconvenience. It changes the direction of risk.'),
    scene('HSL3_036', 'CH05', 'When pressure fails', 'backsiphonage', 'generated_ai', 'Cutaway of low-pressure pipe beside contaminated soil and a cross-connection pulling orange particles toward the main', ['EPA-LOSS-OF-PRESSURE-2026', 'EPA-DISTRIBUTION-SYSTEMS-2025'], 'Under low or no pressure, backsiphonage can become possible. A cross-connection or damaged section can let non-potable material move where it should never go. The normal direction of protection depends on pressure. When pressure disappears, the pipe loses part of its authority.', 'invisible_process'),
    scene('HSL3_037', 'CH05', 'When pressure fails', 'issue_advisory', 'remotion', 'Boil water advisory spreads over affected blocks with drinking, cooking and infant-formula instructions separated', ['CDC-DRINKING-WATER-ADVISORIES-2026'], 'That is why an advisory can follow a pressure event. CDC says a boil water advisory tells people to use bottled water or boil tap water and to follow local officials. The advisory is not a declaration that every drop is contaminated. It is a public-health response to uncertainty while the system is tested and restored.'),
    scene('HSL3_038', 'CH05', 'When pressure fails', 'isolate_break', 'generated_ai', 'Utility crews close underground valves around a ruptured main while blue flow reroutes around an orange dead zone', [], 'Crews do not repair the entire city. They isolate the break. Valves close, pressure zones change, customers lose service in a bounded area, and neighboring pipes may carry different loads. A valve that almost nobody noticed yesterday becomes the difference between a local outage and a wider failure.', 'reconstruction'),
    scene('HSL3_039', 'CH05', 'When pressure fails', 'repair_and_flush', 'generated_ai', 'Pipe repair sequence shows excavation, replacement sleeve, flushing hydrant and clear water returning through the main', [], 'Repair is physical and procedural. The pipe must be exposed, fixed, flushed, pressurized and verified. Water rushing from a hydrant is not wasteful theater in this context. It can be part of clearing disturbed water, restoring flow, and preparing the system for samples and return to service.', 'transition'),
    scene('HSL3_040', 'CH05', 'When pressure fails', 'restore_evidence', 'remotion', 'Timeline shows pressure restored, flushing completed, samples collected and advisory lifted only after confirmation', ['CDC-DRINKING-WATER-ADVISORIES-2026'], 'The final step is not simply seeing water flow again. Local authorities may need testing and confirmation before advisories end. The system has to restore both service and confidence. In water, a repair is not complete when the street is dry. It is complete when the public-health promise is defensible again.'),
    scene('HSL3_041', 'CH05', 'When pressure fails', 'chapter_reframe', 'typography', 'LOW PRESSURE TURNS A PIPE INTO A QUESTION.', [], 'This is the failure logic of the episode. A pipe is safe because treated water moves through it under controlled pressure and residual protection. Remove pressure, and the system must ask again what entered, what moved, who is affected, and what proof is needed before ordinary use can return.'),

    scene('HSL3_042', 'CH06', 'Why it stays invisible', 'control_room', 'generated_ai', 'Water utility control room at night with pump status, tank levels, pressure alarms and flow maps glowing on screens', [], 'Most days, the system does not fail. Operators watch tank levels, pump status, pressure, flows, water quality signals and alarms. The work is quiet because success is quiet. The public notices the system mainly when color changes, pressure drops, a street floods, or a notice arrives.', 'atmosphere'),
    scene('HSL3_043', 'CH06', 'Why it stays invisible', 'model_network', 'remotion', 'Hydraulic model tests tank levels, pump operations and pressure zones before a demand spike', ['EPA-DISTRIBUTION-SYSTEMS-2025'], 'EPA points to hydraulic modeling tools that help systems understand movement and water quality inside distribution networks. Modeling can size infrastructure, optimize tanks and pumps, reduce energy use, investigate quality problems and prepare for emergencies. The invisible network has to be simulated because no one can see every pipe at once.'),
    scene('HSL3_044', 'CH06', 'Why it stays invisible', 'fire_demand', 'generated_ai', 'A hydrant opens during an emergency and blue flow surges through mains while household pressure zones rebalance', ['EPA-DISTRIBUTION-SYSTEMS-2025'], 'The same network may also support fire protection. That adds another hidden conflict: a system designed for drinking water must sometimes deliver sudden high flow to a hydrant without collapsing pressure everywhere else. The gallon at your sink shares infrastructure with emergencies you may never see.', 'reconstruction'),
    scene('HSL3_045', 'CH06', 'Why it stays invisible', 'commercial_demand', 'generated_ai', 'Morning city wakes as restaurants, apartments, offices and hospitals pull water from the same pressure zone', ['EPA-DISTRIBUTION-SYSTEMS-2025'], 'Domestic use is only one demand. EPA notes distribution systems may also support agricultural and commercial uses, depending on the system. A hospital, restaurant, apartment tower, laundromat and home can all pull on the same hidden reserve. The network is not serving one faucet. It is serving a schedule.', 'scale'),
    scene('HSL3_046', 'CH06', 'Why it stays invisible', 'data_and_trust', 'remotion', 'Water quality reports, contaminant limits and operator sampling form the evidence layer behind the tap', ['EPA-DRINKING-WATER-REGULATIONS-2026', 'CDC-DRINKING-WATER-ABOUT-2025'], 'Trust is partly mechanical and partly informational. EPA sets contaminant limits and testing methods. CDC says customers served by a public system must be told if water quality does not meet EPA standards. The public promise is therefore delivered twice: in the pipe and in the record.'),
    scene('HSL3_047', 'CH06', 'Why it stays invisible', 'asset_management', 'remotion', 'Old pipe segments, break history, replacement cost and service priority create an underground replacement map', ['EPA-DISTRIBUTION-SYSTEMS-2025', 'ASCE-DRINKING-WATER-INFRASTRUCTURE-2025'], 'Aging infrastructure turns reliability into a prioritization problem. EPA describes asset management as a framework for delivering service while managing infrastructure cost. ASCE describes enormous long-term needs. Utilities must decide which invisible pipes to replace before they become visible through failure.'),
    scene('HSL3_048', 'CH06', 'Why it stays invisible', 'state_limitation', 'typography', 'NO TWO CITIES HAVE THE SAME WATER MAP.', [], 'A mountain town, a coastal city, a desert suburb and an old industrial neighborhood do not share one universal water machine. Their sources, elevations, treatment, pipes and risks differ. The shared principle is that safe tap water requires controlled flow, not just available water.'),

    scene('HSL3_049', 'CONCLUSION', 'Run the journey again', 'reverse_map', 'remotion', 'The complete water journey resets from source to tap with each successful handoff highlighted', [], 'Run the journey again. Water is collected from a source. Raw flow enters treatment. Particles gather and settle. Filters remove what should not remain. Disinfection reduces microbial risk. Finished water enters storage. Pumps and elevation create pressure. Pipes carry it across the city. A service line brings it home.'),
    scene('HSL3_050', 'CONCLUSION', 'Run the journey again', 'payoff_pressure', 'generated_ai', 'Kitchen faucet opens while the camera reveals a glowing pressure envelope extending back through streets to tanks and pumps', [], 'When the faucet opens, the gallon does not begin moving because you asked politely. It moves because a city was already holding pressure behind it. The motion at the sink is the visible release of stored energy, protected chemistry and coordinated infrastructure.', 'transition'),
    scene('HSL3_051', 'CONCLUSION', 'Run the journey again', 'complete_failure_logic', 'remotion', 'Normal path and failure path split: pressure holds, water arrives; pressure fails, advisory and restoration begin', [], 'That is why the same system can feel effortless one day and fragile the next. If the chain holds, water appears. If pressure fails, the system has to isolate, repair, flush, test and communicate. The faucet shows the outcome, not the amount of work required to make the outcome trustworthy.'),
    scene('HSL3_052', 'CONCLUSION', 'The hidden product', 'deliver_payoff', 'typography', 'THE TAP DOES NOT DELIVER WATER. IT REVEALS A SYSTEM THAT ALREADY DID.', [], 'The hidden journey of water is not only distance from reservoir to kitchen. It is the journey from nature to evidence, from treatment to pressure, from buried pipe to public trust. The next time a glass fills in seconds, the simple miracle is not that water came out. It is that everything before the tap stayed true.')
  ],
  human_approval_status: 'APPROVED'
};
