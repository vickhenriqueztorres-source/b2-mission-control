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

export const HSL_VIDEO_4_EPISODE_SEED: HslEpisodeSeed = {
  episode_id: 'HSL-VIDEO-004',
  title: 'How the Internet Gets to Your House',
  format: 'THE_JOURNEY',
  target_duration_minutes: 14,
  central_question: 'What invisible chain has to work before a video, message or webpage appears instantly inside a home?',
  thesis: 'Home internet feels local because a global system of undersea cables, landing stations, data centers, routing networks, local providers, fiber cabinets, neighborhood drops and home equipment has already moved the request most of the way before the screen changes.',
  object_or_flow: 'One video request traveling from a home router through the access network, ISP core, internet exchange or transit route, data center, DNS lookup path and back through fiber to the home',
  system_being_analyzed: 'The physical and logical internet delivery chain from global backbone infrastructure to last-mile residential service',
  main_constraint: 'The system must move data through many owners, physical routes and protocol decisions while keeping latency, congestion, packet loss, power, routing and local equipment within usable limits',
  primary_consequence: 'When one link becomes congested, misrouted, damaged or underpowered, the internet does not simply disappear; it slows, reroutes, buffers, drops packets or fails at the smallest visible point: the screen at home',
  hero_visual: 'A cinematic night journey follows a yellow packet from a living-room router into fiber, through a street cabinet, across a city backbone, into a data center, under the ocean and back again as blue infrastructure holds steady and orange bottlenecks reveal failure points.',
  causal_flow: ['home_device', 'router', 'last_mile_access', 'local_isp', 'regional_backbone', 'dns_and_routing', 'data_center', 'return_path', 'home_screen'],
  system_interfaces: ['wi_fi_radio', 'home_router', 'fiber_ont', 'street_cabinet', 'isp_pop', 'internet_exchange', 'dns_resolver', 'content_delivery_node', 'submarine_cable_landing'],
  original_interpretation: 'The internet does not arrive at the house. The house is the final socket of a global logistics system for packets.',
  counterargument_or_limitation: 'Actual paths vary by country, provider, technology, content network, peering agreement, wireless conditions and outage state; this episode explains a representative broadband path rather than one universal route.',
  audience_strategy: {
    primary_audience: 'People who use Wi-Fi every day and rarely see the physical chain behind it',
    awareness_level: 1,
    sophistication_level: 2,
    what_they_know: 'They know the router, Wi-Fi password and monthly bill, and they notice buffering when something feels slow.',
    knowledge_gap: 'They do not see the chain of fiber, routing, DNS, peering and data centers that has to work before the router can deliver anything.',
    mass_desire: 'Reveal the hidden global machine behind an ordinary click at home.',
    human_conflict: 'A family blames the router while the real delay may be in Wi-Fi, a local splitter, ISP routing, a congested exchange, a DNS lookup or a distant content path.',
    thumbnail_text: 'BEFORE WIFI',
    title_candidates: [
      'How the Internet Gets to Your House',
      'The Hidden System Behind Your Wi-Fi'
    ],
    next_video_question: 'What happens when a data center goes offline?'
  },
  sources: [
    {
      source_id: 'ICANN-DNS-BASICS-2026',
      category: 'primary',
      url: 'https://www.icann.org/resources/pages/what-2012-02-25-en',
      accessed_at: '2026-08-24',
      claims: [
        'ICANN explains that the Domain Name System translates human-readable names into the numerical addresses used by computers.',
        'ICANN describes DNS as a distributed directory system rather than one central list.'
      ],
      limitations: ['The ICANN overview explains naming and addressing, not every operational detail of residential broadband.']
    },
    {
      source_id: 'CLOUDFLARE-INTERNET-WORKS-2026',
      category: 'technical',
      url: 'https://www.cloudflare.com/learning/network-layer/how-does-the-internet-work/',
      accessed_at: '2026-08-24',
      claims: [
        'Cloudflare describes the internet as a network of networks.',
        'Cloudflare explains that data crosses networks as packets and can take different routes.'
      ],
      limitations: ['Cloudflare is an infrastructure company and educational source, not a public regulator.']
    },
    {
      source_id: 'CLOUDFLARE-CDN-2026',
      category: 'technical',
      url: 'https://www.cloudflare.com/learning/cdn/what-is-a-cdn/',
      accessed_at: '2026-08-24',
      claims: [
        'Cloudflare describes a content delivery network as distributed servers that can serve content closer to users.',
        'A CDN can reduce latency by shortening the distance content travels.'
      ],
      limitations: ['CDN behavior depends on provider configuration, cache state and the requested content.']
    },
    {
      source_id: 'FCC-BROADBAND-DATA-2026',
      category: 'primary',
      url: 'https://broadbandmap.fcc.gov/home',
      accessed_at: '2026-08-24',
      claims: [
        'The FCC National Broadband Map presents fixed and mobile broadband availability information in the United States.',
        'Broadband availability can vary by address and technology.'
      ],
      limitations: ['The map is an availability resource and does not expose each provider internal route.']
    },
    {
      source_id: 'TELEGEOGRAPHY-SUBMARINE-CABLE-MAP-2026',
      category: 'independent',
      url: 'https://www.submarinecablemap.com/',
      accessed_at: '2026-08-24',
      claims: [
        'TeleGeography maps global submarine cable systems and landing points.',
        'International internet connectivity depends heavily on undersea cable routes.'
      ],
      limitations: ['The public map is a high-level industry reference and not a real-time operational status feed.']
    },
    {
      source_id: 'ARIN-IP-ADDRESSING-2026',
      category: 'primary',
      url: 'https://www.arin.net/resources/guide/internet_number_resources/',
      accessed_at: '2026-08-24',
      claims: [
        'ARIN explains that internet number resources include IP addresses and autonomous system numbers.',
        'These resources help identify networks and endpoints in internet routing.'
      ],
      limitations: ['ARIN covers number resources, not the physical fiber path to a specific house.']
    },
    {
      source_id: 'INTERNET-SOCIETY-IXP-2026',
      category: 'independent',
      url: 'https://www.internetsociety.org/issues/ixps/',
      accessed_at: '2026-08-24',
      claims: [
        'The Internet Society describes internet exchange points as places where networks can exchange traffic.',
        'IXPs can improve local internet performance by keeping traffic paths shorter.'
      ],
      limitations: ['IXP benefits vary by local market, participating networks and traffic patterns.']
    }
  ],
  scenes: [
    scene('HSL4_001', 'HOOK', 'Before Wi-Fi', 'introduce_puzzle', 'generated_ai', 'A phone loads a video in a dark living room while a yellow packet dives from the router into glowing fiber under the floor', [], 'You tap a video, and it appears inside your house. It feels as if the internet lives in the router. But the router is not the source. It is the last visible box in a chain that may cross a street cabinet, an ISP network, a data center, an exchange point, a DNS resolver, and sometimes an ocean before the first frame reaches your screen.', 'scale'),
    scene('HSL4_002', 'HOOK', 'Before Wi-Fi', 'early_evidence', 'remotion', 'Home request becomes packets, address lookup, route choice and return traffic before the screen updates', ['CLOUDFLARE-INTERNET-WORKS-2026', 'ICANN-DNS-BASICS-2026'], 'The internet is not one cable and not one cloud. It is a network of networks. A request has to be broken into packets, addressed, routed, answered and assembled again. If any part of that chain adds delay, the user usually sees only one symptom: the page stalls or the video buffers.'),
    scene('HSL4_003', 'HOOK', 'Before Wi-Fi', 'open_question', 'typography', 'THE ROUTER IS THE LAST MILE, NOT THE WHOLE INTERNET.', [], 'So this episode follows one request from a home to the system behind it. We are not asking why Wi-Fi is annoying. We are asking what has to work before Wi-Fi has anything useful to deliver.'),

    scene('HSL4_004', 'CH01', 'Inside the house', 'home_radio_layer', 'generated_ai', 'Wi-Fi waves move through a house as walls, devices and interference bend the last invisible hop before the router', [], 'The first hidden system is actually inside the home. Your device may not touch fiber directly. It talks by radio to a router or access point. Walls, distance, neighboring networks and device quality all affect this tiny final hop. The global internet can be healthy while the last ten meters inside the house are the weakest part.', 'invisible_process'),
    scene('HSL4_005', 'CH01', 'Inside the house', 'router_boundary', 'generated_ai', 'Home router and optical network terminal hand off packets from Wi-Fi into a fiber line leaving the house', [], 'Then the router hands traffic to the access connection. In many fiber homes, an optical network terminal converts light from the provider network into usable Ethernet for the router. The customer sees a plastic box. The system sees an interface between a private home network and a managed provider network.', 'transition'),
    scene('HSL4_006', 'CH01', 'Inside the house', 'local_fault_split', 'remotion', 'Slow internet splits into Wi-Fi issue, router issue, provider access issue and remote service issue', [], 'This is why slow internet is hard to diagnose from the couch. The failure can be local Wi-Fi, the router, the modem or terminal, the street connection, the provider core, a DNS issue, a congested route, or the service being contacted. One spinning icon hides many possible causes.'),

    scene('HSL4_007', 'CH02', 'The last mile', 'leave_house', 'generated_ai', 'A fiber drop leaves a house, follows a pole line and enters a neighborhood cabinet at dusk', ['FCC-BROADBAND-DATA-2026'], 'Outside the house, the request enters what providers call the access network, or last mile. This is the part that varies by address. One street may have fiber. Another may use cable. A rural road may depend on fixed wireless or satellite. The internet is global, but access is local and very physical.', 'scale'),
    scene('HSL4_008', 'CH02', 'The last mile', 'cabinet_split', 'generated_ai', 'Neighborhood fiber cabinet glows with splitters and patch panels as many homes share upstream capacity', [], 'At a cabinet, pedestal or node, many individual homes become part of a shared provider design. Splitters, coax nodes, radios or cabinets aggregate local demand. This is where the idea of your personal connection meets the economics of serving a neighborhood. Capacity is planned, shared, upgraded and sometimes exhausted.', 'invisible_process'),
    scene('HSL4_009', 'CH02', 'The last mile', 'availability_map', 'remotion', 'Address-level broadband availability changes by technology, provider footprint and local buildout', ['FCC-BROADBAND-DATA-2026'], 'The FCC broadband map exists because availability is not the same everywhere. A provider can serve one side of a road and not the other. A building can have one technology available while another nearby has several. The internet reaches homes through construction decisions, not magic coverage.'),

    scene('HSL4_010', 'CH03', 'The provider network', 'isp_pop', 'generated_ai', 'Local ISP point of presence with fiber racks, routers and yellow packet pulses entering a regional backbone', ['ARIN-IP-ADDRESSING-2026'], 'The access network feeds into a provider point of presence. Here, traffic is aggregated, authenticated, monitored and pushed into larger routers. The home request now becomes part of a regional flow. It carries addresses that tell networks where it came from, where it should go, and which systems are allowed to handle it.', 'transition'),
    scene('HSL4_011', 'CH03', 'The provider network', 'backbone_route', 'generated_ai', 'Regional fiber backbone at night connects city nodes as a packet chooses one bright path among several routes', ['CLOUDFLARE-INTERNET-WORKS-2026'], 'From there, the request may move across a backbone. A backbone is not one road. It is a mesh of long-haul fiber, routers and interconnection points. Packets can cross different paths depending on policy, capacity and failure. The route that feels instant to you may be a negotiated path between networks.', 'invisible_process'),
    scene('HSL4_012', 'CH03', 'The provider network', 'exchange_point', 'generated_ai', 'Internet exchange facility where multiple networks meet and pass traffic across blue-lit fiber panels', ['INTERNET-SOCIETY-IXP-2026'], 'Sometimes traffic passes through an internet exchange point, a place where networks connect to exchange traffic more directly. Keeping traffic local can reduce distance, cost and latency. The exchange is one of the reasons the internet is not a single company. It is a set of agreements made physical in racks and fiber panels.', 'scale'),
    scene('HSL4_013', 'CH03', 'The provider network', 'routing_vs_distance', 'remotion', 'Shortest physical distance is compared with provider routing, peering and congestion decisions', [], 'The shortest map distance is not always the chosen internet path. Business agreements, network policies, outages and congestion all shape routing. A request to a nearby service can sometimes travel farther than expected, while a distant service may feel fast because it has a node close to your provider.'),

    scene('HSL4_014', 'CH04', 'Finding the destination', 'dns_lookup', 'generated_ai', 'DNS lookup visualized as a directory query turning a human domain into an IP address before the route continues', ['ICANN-DNS-BASICS-2026'], 'Before many requests can leave with confidence, the system needs an address. DNS translates names people understand into addresses computers can use. ICANN describes DNS as a distributed directory, which matters because there is no single magic book under your router. The lookup itself is part of the journey.', 'invisible_process'),
    scene('HSL4_015', 'CH04', 'Finding the destination', 'cdn_nearby', 'generated_ai', 'Content delivery node inside a data center serves a video from a nearby cache instead of a distant origin', ['CLOUDFLARE-CDN-2026'], 'If the content is popular, the answer may not come from the original server far away. It may come from a content delivery network node closer to the user. This is one of the internet quiet tricks: the video feels global, but the copy you receive may be stored in a nearby data center.', 'transition'),
    scene('HSL4_016', 'CH04', 'Finding the destination', 'data_center', 'generated_ai', 'Rows of servers in a data center respond to the packet while power, cooling and network links keep the answer moving', [], 'A data center is not an abstract cloud. It is a building full of power systems, cooling, servers, switches and fiber. When the request reaches the right service, machines retrieve data, compute a response and send packets back. The cloud becomes real the moment you follow the cable into the room.', 'scale'),
    scene('HSL4_017', 'CH04', 'Finding the destination', 'submarine_option', 'generated_ai', 'Submarine cable landing station receives a glowing route from undersea fiber and hands it into terrestrial networks', ['TELEGEOGRAPHY-SUBMARINE-CABLE-MAP-2026'], 'For international traffic, the path may include undersea cables. TeleGeography maps the cable systems and landing points that connect continents. The cloud across the ocean is still a physical route: glass fiber in protected cable, repeaters, landing stations and terrestrial networks on both sides.', 'scale'),

    scene('HSL4_018', 'CH05', 'Why it slows down', 'latency_stack', 'remotion', 'Total delay stacks Wi-Fi airtime, access link, routing, DNS, server response and return path', [], 'Speed is not one number. Latency is the time before something responds. Throughput is how much data can move. Packet loss is when pieces vanish and must be resent. A video can buffer because capacity is tight, because latency is high, because packets are lost, or because the server is slow.'),
    scene('HSL4_019', 'CH05', 'Why it slows down', 'bottleneck_congestion', 'generated_ai', 'Orange congestion builds at an ISP router while yellow packets queue before continuing downstream', [], 'Congestion is the internet version of a traffic jam. Packets are still moving, but they wait in buffers, take longer routes or get dropped when queues overflow. To the user, congestion looks emotional: the call freezes, the game spikes, the page half-loads. Underneath, the system is making queue decisions.', 'invisible_process'),
    scene('HSL4_020', 'CH05', 'Why it slows down', 'fiber_cut', 'generated_ai', 'Construction cut severs a buried fiber route and traffic reroutes through a longer orange detour path', [], 'A physical cut can also change the internet without destroying it. If a route is damaged, traffic may move around the break, but the detour can be longer or more crowded. Resilience often means service continues imperfectly. The outage you feel may be the cost of finding another path.', 'transition'),
    scene('HSL4_021', 'CH05', 'Why it slows down', 'home_vs_network', 'remotion', 'Same buffering symptom branches into home Wi-Fi, last-mile saturation, provider peering, DNS failure and server overload', [], 'That is why the same symptom can have different causes. A speed test may look fine while one app fails. A neighbor may be slow while you are not. A phone may struggle while a wired computer works. The visible symptom is simple because the screen is simple. The path behind it is not.'),

    scene('HSL4_022', 'CONCLUSION', 'The return path', 'return_packets', 'generated_ai', 'Packets return from data center through backbone, ISP cabinet, fiber drop, router and finally the home screen', [], 'Now run the path backward. The response leaves the service, crosses data center switches, provider links, exchange points or transit networks, the ISP core, the local access network, the cabinet, the drop, the router and the air inside the house. Only then does the screen make the internet feel local.', 'transition'),
    scene('HSL4_023', 'CONCLUSION', 'The return path', 'full_chain', 'remotion', 'Complete chain lights up from device to router to ISP to DNS to data center and back', [], 'A home connection is therefore not one service. It is a chain of successful handoffs. Radio to router. Router to access link. Access link to provider. Provider to the broader internet. Name to address. Address to server. Server to response. Response back through the chain.'),
    scene('HSL4_024', 'CONCLUSION', 'The hidden product', 'deliver_payoff', 'typography', 'YOUR WIFI DOES NOT CREATE THE INTERNET. IT REVEALS THE PART THAT REACHED YOU.', [], 'The next time a page opens instantly, the miracle is not that the router blinked. It is that a global packet logistics system stayed aligned long enough for the final hop to look effortless. The internet gets to your house by arriving everywhere else first.')
  ],
  human_approval_status: 'APPROVED'
};
