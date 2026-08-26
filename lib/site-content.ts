export const navItems = [
  { label: "Technology", href: "#architecture" },
  { label: "Intelligence", href: "#voltron-ai" },
  { label: "Manufacturing", href: "#alpha" },
  { label: "Business Model", href: "#model" },
  { label: "About", href: "#people" },
  { label: "Partner With Us", href: "#partner", cta: true }
] as const;

export const philosophy = ["Repeatable", "Measurable", "Traceable", "Scalable", "Intelligent"] as const;

export type AgentAction = {
  label: string;
  icon: "confirm" | "capture" | "escalate" | "analyze" | "trace" | "investigate";
};

export type VoltronAgent = {
  id: string;
  name: string;
  title: string;
  role: string;
  banner: string;
  bannerHint: string;
  body: string;
  quote: string;
  agentClass: string;
  capability: string;
  tab: string;
  portrait: string;
  actions: AgentAction[];
  investigator?: boolean;
};

export const voltronAgents: VoltronAgent[] = [
  {
    id: "kavo",
    name: "KAVO",
    title: "The Guide",
    role: "Voltron AI // Operator Intelligence",
    banner: "Point of Action",
    bannerHint: "Context at the moment of action.",
    body: "When work requires attention, KAVO brings the relevant lot, process, equipment, SOP, reaction plan and required action directly to the operator.",
    quote: "Know what to do next.",
    agentClass: "Shopfloor Assist",
    capability: "Action · Guidance · HITL",
    tab: "ACT // 01",
    portrait: "/Kavo.webp",
    actions: [
      { label: "Confirm", icon: "confirm" },
      { label: "Capture", icon: "capture" },
      { label: "Escalate", icon: "escalate" }
    ]
  },
  {
    id: "rixa",
    name: "RIXA",
    title: "The Examiner",
    role: "Voltron AI // Quality Intelligence",
    banner: "Quality Context",
    bannerHint: "Inspection connected to evidence.",
    body: "RIXA connects inspection results to process evidence, Control Plans, PFMEA, calibration and manufacturing history.",
    quote: "Understand why quality changed.",
    agentClass: "Quality Assist",
    capability: "Inspect · Evidence · Trace",
    tab: "QC // 02",
    portrait: "/Rixa.webp",
    actions: [
      { label: "Inspect", icon: "capture" },
      { label: "Trace", icon: "trace" },
      { label: "Escalate", icon: "escalate" }
    ]
  },
  {
    id: "meko",
    name: "MEKO",
    title: "The Mechanic",
    role: "Voltron AI // Maintenance Intelligence",
    banner: "Machine Sense",
    bannerHint: "Equipment behaviour in context.",
    body: "MEKO connects equipment behaviour, alarms, runtime and maintenance history to help diagnose emerging problems before downtime.",
    quote: "Listen before the machine stops.",
    agentClass: "Maintenance Assist",
    capability: "Diagnose · Checklist · HITL",
    tab: "MNT // 03",
    portrait: "/Meko.webp",
    actions: [
      { label: "Diagnose", icon: "analyze" },
      { label: "Capture", icon: "capture" },
      { label: "Escalate", icon: "escalate" }
    ]
  },
  {
    id: "zilo",
    name: "ZILO",
    title: "The Systems Thinker",
    role: "Voltron AI // Process Intelligence",
    banner: "See the Process",
    bannerHint: "Patterns across production.",
    body: "ZILO finds relationships across process parameters, recipes, quality outcomes, energy and production behaviour.",
    quote: "Every process leaves a pattern.",
    agentClass: "Process Assist",
    capability: "Analyze · Optimize · Learn",
    tab: "PRC // 04",
    portrait: "/Zilo.webp",
    actions: [
      { label: "Analyze", icon: "analyze" },
      { label: "Trace", icon: "trace" },
      { label: "Capture", icon: "capture" }
    ]
  },
  {
    id: "saro",
    name: "SARO",
    title: "The Keeper",
    role: "Voltron AI // Evidence Intelligence",
    banner: "Memory",
    bannerHint: "Traceable real-world outcomes.",
    body: "SARO connects process evidence, inspections, calibration, reports and genealogy into one traceable record.",
    quote: "Know what happened. Prove it.",
    agentClass: "Evidence Assist",
    capability: "Record · Trace · Release",
    tab: "EVD // 05",
    portrait: "/Saro.webp",
    actions: [
      { label: "Trace", icon: "trace" },
      { label: "Capture", icon: "capture" },
      { label: "Confirm", icon: "confirm" }
    ]
  },
  {
    id: "teyo",
    name: "TEYO",
    title: "The Investigator",
    role: "Voltron AI // Fault Investigation Intelligence",
    banner: "Root Cause",
    bannerHint: "When problems cross domains.",
    body: "When a problem crosses Quality, Process, Maintenance and Evidence, TEYO coordinates the Voltron AI specialists through competing hypotheses and evidence review.",
    quote: "AI investigates. Evidence supports. Humans decide.",
    agentClass: "Investigation Hub",
    capability: "Coordinate · Hypothesize · Review",
    tab: "INV // 00",
    portrait: "/Teyo.webp",
    investigator: true,
    actions: [
      { label: "Investigate", icon: "investigate" },
      { label: "Analyze", icon: "analyze" },
      { label: "Escalate", icon: "escalate" }
    ]
  }
];

export const manufacturingContextPhases = [
  {
    id: "define",
    title: "Define",
    icon: "requirement",
    nodes: ["Customer", "Part / Revision", "Requirement"]
  },
  {
    id: "plan",
    title: "Plan",
    icon: "shield",
    nodes: ["Process", "PFMEA + Control Plan"]
  },
  {
    id: "execute",
    title: "Execute",
    icon: "lot",
    nodes: ["Lot / Rack", "Equipment + Process Data"]
  },
  {
    id: "verify",
    title: "Verify",
    icon: "inspect",
    nodes: ["Inspection + Evidence", "NCR / CAPA"]
  },
  {
    id: "release",
    title: "Release",
    icon: "dispatch",
    nodes: ["Release / Dispatch"]
  }
] as const;

export const manufacturingContextSteps = [
  { label: "Customer", detail: "Who we manufacture for.", icon: "customer" },
  { label: "Part / Revision", detail: "What we are manufacturing.", icon: "part" },
  { label: "Requirement", detail: "What is required.", icon: "requirement" },
  { label: "Process", detail: "How it will be produced.", icon: "process" },
  { label: "PFMEA + Control Plan", detail: "How we plan quality in.", icon: "shield" },
  { label: "Lot / Rack", detail: "Which lot and where it is stored.", icon: "lot" },
  { label: "Equipment + Process Data", detail: "What happened on the shopfloor.", icon: "equipment" },
  { label: "Inspection + Evidence", detail: "What was verified and recorded.", icon: "inspect" },
  { label: "NCR / CAPA", detail: "What issues were raised and resolved.", icon: "ncr" },
  { label: "Release / Dispatch", detail: "What was released and dispatched.", icon: "dispatch" }
] as const;

/** @deprecated Use manufacturingContextSteps */
export const manufacturingContextChain = manufacturingContextSteps.map((step) => step.label);

export const contextOutcomes = [
  {
    id: "shopfloor",
    title: "Shopfloor",
    body: "Right action, right context.",
    icon: "shopfloor"
  },
  {
    id: "engineering",
    title: "Engineering",
    body: "Connected investigation.",
    icon: "engineer"
  },
  {
    id: "customer",
    title: "Customer",
    body: "Live status and trusted traceability.",
    icon: "customer"
  }
] as const;

export const qmsDigitalSources = [
  { label: "SCADA evidence", icon: "chart" },
  { label: "Digital inspection", icon: "target" },
  { label: "Connected gauges", icon: "speedometer" },
  { label: "Calibration", icon: "caliper" },
  { label: "NCR / CAPA", icon: "shield" }
] as const;

export const qmsExistingSources = [
  { label: "PDF / Excel", icon: "document" },
  { label: "Lab report", icon: "beaker" },
  { label: "Certificate", icon: "certificate" },
  { label: "Photo", icon: "photo" },
  { label: "Manual input", icon: "keyboard" }
] as const;

export const qmsFeaturePillars = [
  { id: "connected", title: "Connected", body: "Brings all quality records together.", icon: "connected" },
  { id: "contextual", title: "Contextual", body: "Links every record to part, lot and process.", icon: "contextual" },
  { id: "intelligent", title: "Intelligent", body: "Finds patterns and highlights risks.", icon: "intelligent" },
  { id: "actionable", title: "Actionable", body: "Enables faster decisions and resolutions.", icon: "actionable" },
  { id: "continuous", title: "Continuous", body: "Improves quality across the network.", icon: "continuous" }
] as const;

export const voltronAiGenericSteps = [
  { label: "Prompt", icon: "prompt" },
  { label: "Model", icon: "network" },
  { label: "Response", icon: "response" }
] as const;

export const voltronAiContextInputs = [
  { label: "Process state", icon: "state" },
  { label: "Lot context", icon: "lot" },
  { label: "Quality context", icon: "shield" },
  { label: "Equipment", icon: "equipment" },
  { label: "Evidence", icon: "evidence" },
  { label: "History", icon: "history" }
] as const;

export const voltronAiCapabilities = [
  { title: "Real-time visibility", body: "Understands what's happening now.", icon: "visibility" },
  { title: "Deep manufacturing context", body: "Knows the lot, process, equipment, and more.", icon: "contextual" },
  { title: "Proactive intelligence", body: "Connects the dots across plans, history, and evidence.", icon: "brain" },
  { title: "Actionable guidance", body: "Delivers the right assistance in the right moment.", icon: "spark" }
] as const;

export const voltronAiAgentCapabilities = [
  { label: "Manufacturing Context", icon: "shopfloor" },
  { label: "Plant + Lot Awareness", icon: "target" },
  { label: "History + Rules", icon: "brain" },
  { label: "Actionable Guidance", icon: "actionable" }
] as const;

export const hitlExample = {
  agent: "KAVO",
  situation: "Lot 1842 · Tank 3",
  message: "Thickness out of band. Follow reaction plan RP-12.",
  actions: [
    { label: "Confirm", icon: "confirm", primary: true },
    { label: "Capture", icon: "capture", primary: false },
    { label: "Escalate", icon: "escalate", primary: false }
  ]
} as const;

export const hitlSequence = [
  "AI investigates",
  "Evidence supports",
  "Humans decide"
] as const;

export const teyoWorkspaceFlow = [
  { label: "Hypotheses", detail: "Possible causes", icon: "hypothesis" },
  { label: "Evidence", detail: "Cross-domain validation", icon: "evidence" },
  { label: "Human Review", detail: "Approve the conclusion", icon: "human" },
  { label: "Action", detail: "Take confident action", icon: "play" }
] as const;

export const teyoWorkspaceOutputs = [
  { label: "Root Cause", icon: "inspect" },
  { label: "Confidence", icon: "chart" },
  { label: "Recommended Action", icon: "actionable" }
] as const;

export const teyoInvestigationFlow = [
  { label: "Competing hypotheses", detail: "Multiple theories evaluated in parallel.", icon: "hypothesis" },
  { label: "Evidence", detail: "Quality, process, maintenance and genealogy connected.", icon: "evidence" },
  { label: "Human review", detail: "AI investigates. Humans decide.", icon: "human" }
] as const;

export const teyoStrengths = [
  "Cross-domain reasoning",
  "Evidence-driven analysis",
  "Root cause identification",
  "Actionable recommendations"
] as const;

export const voltronAiPrinciples = [
  { title: "Manufacturing context aware", icon: "shopfloor" },
  { title: "Connects lot, process, equipment & more", icon: "contextual" },
  { title: "Knows your plant, history & rules", icon: "history" },
  { title: "Accurate, actionable & accountable", icon: "actionable" }
] as const;

export const leaders = [
  {
    name: "Omkar",
    role: "Founder & Chief Technology Officer",
    discipline: "Technology & IP",
    cred: "IIT Madras · B.Tech + M.Tech · 10+ years in engineering, innovation and management",
    focus: "Technology architecture, digital manufacturing systems, product roadmap and Voltron intellectual property.",
    image: "/team/voltron_technology_ip.webp"
  },
  {
    name: "Akshay",
    role: "Chief Operating Officer",
    discipline: "Operations",
    cred: "MBA — Marketing & Operations · 10+ Years",
    focus: "Manufacturing operations, customer delivery and operating discipline.",
    image: "/team/voltron_operations.webp"
  },
  {
    name: "Hanumanat",
    role: "Chief Installation & Maintenance Officer",
    discipline: "Plant Engineering",
    cred: "18+ Years in Plant Engineering",
    focus: "Physical infrastructure, installation and lifecycle reliability.",
    image: "/team/voltron_plant_engineering.webp"
  }
] as const;
