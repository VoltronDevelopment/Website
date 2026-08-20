import type { Milestone, Project, ProjectStatus, TaskPriority, Workstream } from "@/lib/projects-types";

/** W1 starts 15 Aug 2026; each week is 7 days. */
const WEEK_STARTS = [
  "2026-08-15", // W1
  "2026-08-22", // W2
  "2026-08-29", // W3
  "2026-09-05", // W4
  "2026-09-12", // W5
  "2026-09-19", // W6
  "2026-09-26", // W7
  "2026-10-03", // W8
  "2026-10-10", // W9
  "2026-10-17", // W10
  "2026-10-24", // W11
  "2026-10-31" // W12
] as const;

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function weekRange(fromWeek: number, toWeek: number): { startDate: string; endDate: string } {
  const startDate = WEEK_STARTS[fromWeek - 1];
  const endDate = addDays(WEEK_STARTS[toWeek - 1], 6);
  return { startDate, endDate };
}

type Role = "Omkar" | "Akshay" | "Hanumanat";

type GateId =
  | "ms-incorporated"
  | "ms-site"
  | "ms-plant-acquired"
  | "ms-physical-plant"
  | "ms-admin"
  | "ms-scada"
  | "ms-website"
  | "ms-operational";

/** CTO → Omkar, COO → Akshay, CIMO → Hanumanat; dual-owner → first role. */
type SeedTask = {
  n: number;
  name: string;
  owner: Role;
  from: number;
  to: number;
  milestoneId: GateId;
  priority: TaskPriority;
};

const MILESTONES: Milestone[] = [
  {
    id: "ms-incorporated",
    name: "Company Incorporated",
    startDate: "2026-08-29",
    endDate: "2026-09-04",
    owner: "Akshay",
    status: "not_started"
  },
  {
    id: "ms-site",
    name: "Site Secured",
    startDate: "2026-08-29",
    endDate: "2026-09-04",
    owner: "Akshay",
    status: "not_started"
  },
  {
    id: "ms-plant-acquired",
    name: "Alpha Plant Acquired",
    startDate: "2026-09-12",
    endDate: "2026-09-18",
    owner: "Akshay",
    status: "not_started"
  },
  {
    id: "ms-physical-plant",
    name: "Physical Plant Ready",
    startDate: "2026-10-03",
    endDate: "2026-10-09",
    owner: "Hanumanat",
    status: "not_started"
  },
  {
    id: "ms-admin",
    name: "Founder Admin Live",
    startDate: "2026-10-03",
    endDate: "2026-10-09",
    owner: "Omkar",
    status: "not_started"
  },
  {
    id: "ms-scada",
    name: "SCADA Live",
    startDate: "2026-10-17",
    endDate: "2026-10-23",
    owner: "Omkar",
    status: "not_started"
  },
  {
    id: "ms-website",
    name: "Website Live",
    startDate: "2026-10-24",
    endDate: "2026-10-30",
    owner: "Omkar",
    status: "not_started"
  },
  {
    id: "ms-operational",
    name: "Voltron Alpha v1 Operational",
    startDate: "2026-10-31",
    endDate: "2026-11-15",
    owner: "Omkar",
    status: "not_started"
  }
];

/**
 * 90-day master Gantt (tasks 1–90). Weeks are inclusive.
 * Every task is assigned to exactly one founder gate + priority.
 */
const SEED_TASKS: SeedTask[] = [
  // —— Company Incorporated ——
  {
    n: 1,
    name: "Finalize founders, directors & cap table",
    owner: "Akshay",
    from: 1,
    to: 1,
    milestoneId: "ms-incorporated",
    priority: "p1"
  },
  {
    n: 2,
    name: "CS handover — V-CORP dossier",
    owner: "Akshay",
    from: 1,
    to: 1,
    milestoneId: "ms-incorporated",
    priority: "p1"
  },
  {
    n: 3,
    name: "MoA / AoA / incorporation documentation",
    owner: "Akshay",
    from: 1,
    to: 2,
    milestoneId: "ms-incorporated",
    priority: "p0"
  },
  {
    n: 4,
    name: "Company incorporation",
    owner: "Akshay",
    from: 2,
    to: 3,
    milestoneId: "ms-incorporated",
    priority: "p0"
  },
  {
    n: 5,
    name: "Corporate bank / auditor / accounting setup",
    owner: "Akshay",
    from: 2,
    to: 4,
    milestoneId: "ms-incorporated",
    priority: "p1"
  },
  {
    n: 6,
    name: "Corporate email, cloud & document structure",
    owner: "Omkar",
    from: 2,
    to: 3,
    milestoneId: "ms-incorporated",
    priority: "p2"
  },
  {
    n: 7,
    name: "Pre-incorporation IP / digital asset transfer",
    owner: "Omkar",
    from: 2,
    to: 4,
    milestoneId: "ms-incorporated",
    priority: "p1"
  },

  // —— Site Secured ——
  {
    n: 8,
    name: "Define Alpha factory-space requirements",
    owner: "Hanumanat",
    from: 1,
    to: 1,
    milestoneId: "ms-site",
    priority: "p1"
  },
  {
    n: 9,
    name: "Shortlist & inspect industrial spaces",
    owner: "Akshay",
    from: 1,
    to: 2,
    milestoneId: "ms-site",
    priority: "p1"
  },
  {
    n: 10,
    name: "Rent / lease negotiation",
    owner: "Akshay",
    from: 2,
    to: 2,
    milestoneId: "ms-site",
    priority: "p1"
  },
  {
    n: 11,
    name: "Lease execution & possession",
    owner: "Akshay",
    from: 2,
    to: 3,
    milestoneId: "ms-site",
    priority: "p0"
  },
  {
    n: 12,
    name: "Detailed site measurement / as-is layout",
    owner: "Hanumanat",
    from: 2,
    to: 3,
    milestoneId: "ms-site",
    priority: "p1"
  },
  {
    n: 13,
    name: "Factory master layout",
    owner: "Hanumanat",
    from: 2,
    to: 4,
    milestoneId: "ms-site",
    priority: "p1"
  },
  {
    n: 14,
    name: "Office / meeting / quality / maintenance layout",
    owner: "Akshay",
    from: 3,
    to: 4,
    milestoneId: "ms-site",
    priority: "p2"
  },

  // —— Alpha Plant Acquired ——
  {
    n: 15,
    name: "Alpha plant technical inspection",
    owner: "Hanumanat",
    from: 1,
    to: 2,
    milestoneId: "ms-plant-acquired",
    priority: "p1"
  },
  {
    n: 16,
    name: "PLC / HMI / electrical assessment",
    owner: "Omkar",
    from: 1,
    to: 2,
    milestoneId: "ms-plant-acquired",
    priority: "p1"
  },
  {
    n: 17,
    name: "Plant valuation & commercial negotiation",
    owner: "Akshay",
    from: 2,
    to: 3,
    milestoneId: "ms-plant-acquired",
    priority: "p1"
  },
  {
    n: 18,
    name: "Plant acquisition / asset documentation",
    owner: "Akshay",
    from: 3,
    to: 5,
    milestoneId: "ms-plant-acquired",
    priority: "p0"
  },

  // —— Physical Plant Ready ——
  {
    n: 19,
    name: "Plant dismantling / relocation planning",
    owner: "Hanumanat",
    from: 3,
    to: 4,
    milestoneId: "ms-physical-plant",
    priority: "p1"
  },
  {
    n: 20,
    name: "Factory cleanup & scrap removal",
    owner: "Hanumanat",
    from: 3,
    to: 4,
    milestoneId: "ms-physical-plant",
    priority: "p2"
  },
  {
    n: 21,
    name: "Roof / wall / drainage / civil repairs",
    owner: "Hanumanat",
    from: 3,
    to: 5,
    milestoneId: "ms-physical-plant",
    priority: "p1"
  },
  {
    n: 22,
    name: "Floor crack repair & preparation",
    owner: "Hanumanat",
    from: 3,
    to: 4,
    milestoneId: "ms-physical-plant",
    priority: "p1"
  },
  {
    n: 23,
    name: "Epoxy / chemical-resistant flooring",
    owner: "Hanumanat",
    from: 4,
    to: 5,
    milestoneId: "ms-physical-plant",
    priority: "p1"
  },
  {
    n: 24,
    name: "Floor markings / walkways / zones",
    owner: "Hanumanat",
    from: 5,
    to: 6,
    milestoneId: "ms-physical-plant",
    priority: "p2"
  },
  {
    n: 25,
    name: "Office partitions / painting / interiors",
    owner: "Hanumanat",
    from: 3,
    to: 5,
    milestoneId: "ms-physical-plant",
    priority: "p2"
  },
  {
    n: 26,
    name: "Office furniture / meeting room / storage",
    owner: "Akshay",
    from: 4,
    to: 6,
    milestoneId: "ms-physical-plant",
    priority: "p2"
  },
  {
    n: 27,
    name: "Factory electrical-load & utility design",
    owner: "Hanumanat",
    from: 2,
    to: 4,
    milestoneId: "ms-physical-plant",
    priority: "p1"
  },
  {
    n: 28,
    name: "Electrical panel / cabling / lighting work",
    owner: "Hanumanat",
    from: 4,
    to: 6,
    milestoneId: "ms-physical-plant",
    priority: "p1"
  },
  {
    n: 29,
    name: "Water / air / drainage / ETP / scrubber utilities",
    owner: "Hanumanat",
    from: 4,
    to: 7,
    milestoneId: "ms-physical-plant",
    priority: "p1"
  },
  {
    n: 30,
    name: "Plant relocation / positioning",
    owner: "Hanumanat",
    from: 5,
    to: 6,
    milestoneId: "ms-physical-plant",
    priority: "p0"
  },
  {
    n: 31,
    name: "Tanks / pumps / motors / gearbox refurbishment",
    owner: "Hanumanat",
    from: 3,
    to: 6,
    milestoneId: "ms-physical-plant",
    priority: "p1"
  },
  {
    n: 32,
    name: "Process piping / heater / burner installation",
    owner: "Hanumanat",
    from: 5,
    to: 7,
    milestoneId: "ms-physical-plant",
    priority: "p1"
  },
  {
    n: 33,
    name: "Mechanical alignment & guarding",
    owner: "Hanumanat",
    from: 5,
    to: 7,
    milestoneId: "ms-physical-plant",
    priority: "p1"
  },
  {
    n: 34,
    name: "Mechanical dry run",
    owner: "Hanumanat",
    from: 7,
    to: 8,
    milestoneId: "ms-physical-plant",
    priority: "p0"
  },

  // —— SCADA Live (controls + IT + commissioning) ——
  {
    n: 35,
    name: "Instrumentation philosophy / sensor list",
    owner: "Omkar",
    from: 3,
    to: 4,
    milestoneId: "ms-scada",
    priority: "p1"
  },
  {
    n: 36,
    name: "PLC I/O architecture / control philosophy",
    owner: "Omkar",
    from: 3,
    to: 5,
    milestoneId: "ms-scada",
    priority: "p1"
  },
  {
    n: 37,
    name: "Instrument procurement",
    owner: "Omkar",
    from: 4,
    to: 5,
    milestoneId: "ms-scada",
    priority: "p1"
  },
  {
    n: 38,
    name: "Sensor installation / field wiring",
    owner: "Hanumanat",
    from: 5,
    to: 7,
    milestoneId: "ms-scada",
    priority: "p1"
  },
  {
    n: 39,
    name: "PLC rewiring / programming / optimization",
    owner: "Omkar",
    from: 5,
    to: 8,
    milestoneId: "ms-scada",
    priority: "p0"
  },
  {
    n: 40,
    name: "Instrument calibration / I/O testing",
    owner: "Omkar",
    from: 6,
    to: 8,
    milestoneId: "ms-scada",
    priority: "p1"
  },
  {
    n: 41,
    name: "Factory LAN / firewall / Wi-Fi / IT infra",
    owner: "Omkar",
    from: 3,
    to: 6,
    milestoneId: "ms-scada",
    priority: "p1"
  },
  {
    n: 42,
    name: "CCTV / network rack / UPS / dashboard displays",
    owner: "Omkar",
    from: 4,
    to: 6,
    milestoneId: "ms-scada",
    priority: "p2"
  },
  {
    n: 43,
    name: "Voltron SCADA architecture",
    owner: "Omkar",
    from: 3,
    to: 5,
    milestoneId: "ms-scada",
    priority: "p1"
  },
  {
    n: 44,
    name: "SCADA PLC connectivity / tag mapping",
    owner: "Omkar",
    from: 5,
    to: 7,
    milestoneId: "ms-scada",
    priority: "p1"
  },
  {
    n: 45,
    name: "SCADA screens / alarms / historian",
    owner: "Omkar",
    from: 6,
    to: 9,
    milestoneId: "ms-scada",
    priority: "p1"
  },
  {
    n: 46,
    name: "Energy / utility data integration",
    owner: "Omkar",
    from: 6,
    to: 9,
    milestoneId: "ms-scada",
    priority: "p2"
  },
  {
    n: 74,
    name: "Electrical + mechanical commissioning",
    owner: "Hanumanat",
    from: 8,
    to: 9,
    milestoneId: "ms-scada",
    priority: "p0"
  },
  {
    n: 75,
    name: "PLC / interlock commissioning",
    owner: "Omkar",
    from: 8,
    to: 9,
    milestoneId: "ms-scada",
    priority: "p0"
  },
  {
    n: 76,
    name: "SCADA commissioning",
    owner: "Omkar",
    from: 9,
    to: 10,
    milestoneId: "ms-scada",
    priority: "p0"
  },

  // —— Founder Admin Live ——
  {
    n: 68,
    name: "Founder Admin project-control module",
    owner: "Omkar",
    from: 5,
    to: 8,
    milestoneId: "ms-admin",
    priority: "p1"
  },
  {
    n: 69,
    name: "Alpha project charter / Gantt loaded in Admin",
    owner: "Omkar",
    from: 7,
    to: 8,
    milestoneId: "ms-admin",
    priority: "p0"
  },

  // —— Website Live ——
  {
    n: 63,
    name: "Voltron logo / visual identity finalization",
    owner: "Akshay",
    from: 1,
    to: 3,
    milestoneId: "ms-website",
    priority: "p3"
  },
  {
    n: 64,
    name: "Visiting cards / IDs / uniforms / PPE branding",
    owner: "Akshay",
    from: 3,
    to: 5,
    milestoneId: "ms-website",
    priority: "p3"
  },
  {
    n: 65,
    name: "Factory exterior / acrylic signage",
    owner: "Akshay",
    from: 4,
    to: 6,
    milestoneId: "ms-website",
    priority: "p3"
  },
  {
    n: 66,
    name: "Factory visual identity / wall graphics / labels",
    owner: "Akshay",
    from: 5,
    to: 7,
    milestoneId: "ms-website",
    priority: "p3"
  },
  {
    n: 67,
    name: "Public website development",
    owner: "Omkar",
    from: 2,
    to: 8,
    milestoneId: "ms-website",
    priority: "p1"
  },
  {
    n: 83,
    name: "Final factory photography / website Alpha assets",
    owner: "Akshay",
    from: 11,
    to: 11,
    milestoneId: "ms-website",
    priority: "p3"
  },
  {
    n: 84,
    name: "Website launch",
    owner: "Omkar",
    from: 11,
    to: 11,
    milestoneId: "ms-website",
    priority: "p0"
  },

  // —— Voltron Alpha v1 Operational ——
  {
    n: 47,
    name: "Voltron ERP Alpha environment",
    owner: "Omkar",
    from: 3,
    to: 5,
    milestoneId: "ms-operational",
    priority: "p1"
  },
  {
    n: 48,
    name: "Customer / supplier / part / material masters",
    owner: "Akshay",
    from: 4,
    to: 6,
    milestoneId: "ms-operational",
    priority: "p1"
  },
  {
    n: 49,
    name: "Purchase / inventory / production flows",
    owner: "Omkar",
    from: 5,
    to: 7,
    milestoneId: "ms-operational",
    priority: "p1"
  },
  {
    n: 50,
    name: "Digital quality workflow",
    owner: "Omkar",
    from: 5,
    to: 8,
    milestoneId: "ms-operational",
    priority: "p1"
  },
  {
    n: 51,
    name: "Lot / rack / part traceability",
    owner: "Omkar",
    from: 6,
    to: 9,
    milestoneId: "ms-operational",
    priority: "p1"
  },
  {
    n: 52,
    name: "SCADA → production lot integration",
    owner: "Omkar",
    from: 7,
    to: 10,
    milestoneId: "ms-operational",
    priority: "p1"
  },
  {
    n: 53,
    name: "Voltron Alpha digital thread",
    owner: "Omkar",
    from: 7,
    to: 10,
    milestoneId: "ms-operational",
    priority: "p1"
  },
  {
    n: 54,
    name: "Asset register / maintenance hierarchy",
    owner: "Hanumanat",
    from: 5,
    to: 7,
    milestoneId: "ms-operational",
    priority: "p2"
  },
  {
    n: 55,
    name: "PM schedules / spare-parts plan",
    owner: "Hanumanat",
    from: 6,
    to: 8,
    milestoneId: "ms-operational",
    priority: "p2"
  },
  {
    n: 56,
    name: "Alpha process-flow / SOP development",
    owner: "Akshay",
    from: 4,
    to: 8,
    milestoneId: "ms-operational",
    priority: "p1"
  },
  {
    n: 57,
    name: "Quality plans / inspection standards",
    owner: "Akshay",
    from: 5,
    to: 9,
    milestoneId: "ms-operational",
    priority: "p1"
  },
  {
    n: 58,
    name: "EHS / PPE / fire / chemical handling setup",
    owner: "Hanumanat",
    from: 4,
    to: 8,
    milestoneId: "ms-operational",
    priority: "p1"
  },
  {
    n: 59,
    name: "Factory compliance / licence applicability review",
    owner: "Akshay",
    from: 2,
    to: 5,
    milestoneId: "ms-operational",
    priority: "p1"
  },
  {
    n: 60,
    name: "Organization chart / manpower plan",
    owner: "Akshay",
    from: 3,
    to: 4,
    milestoneId: "ms-operational",
    priority: "p2"
  },
  {
    n: 61,
    name: "Recruitment & employee onboarding",
    owner: "Akshay",
    from: 4,
    to: 8,
    milestoneId: "ms-operational",
    priority: "p1"
  },
  {
    n: 62,
    name: "Operator / safety / process training",
    owner: "Akshay",
    from: 7,
    to: 9,
    milestoneId: "ms-operational",
    priority: "p1"
  },
  {
    n: 70,
    name: "Cost/kg & factory economics model",
    owner: "Akshay",
    from: 4,
    to: 8,
    milestoneId: "ms-operational",
    priority: "p1"
  },
  {
    n: 71,
    name: "Target customer identification",
    owner: "Akshay",
    from: 5,
    to: 7,
    milestoneId: "ms-operational",
    priority: "p1"
  },
  {
    n: 72,
    name: "Capability deck / RFQ / quotation templates",
    owner: "Akshay",
    from: 5,
    to: 8,
    milestoneId: "ms-operational",
    priority: "p2"
  },
  {
    n: 73,
    name: "Customer outreach / meetings",
    owner: "Akshay",
    from: 6,
    to: 12,
    milestoneId: "ms-operational",
    priority: "p1"
  },
  {
    n: 77,
    name: "Controlled process trials",
    owner: "Akshay",
    from: 9,
    to: 10,
    milestoneId: "ms-operational",
    priority: "p0"
  },
  {
    n: 78,
    name: "Establish process parameter windows",
    owner: "Akshay",
    from: 10,
    to: 11,
    milestoneId: "ms-operational",
    priority: "p1"
  },
  {
    n: 79,
    name: "Validate quality / traceability / SCADA evidence",
    owner: "Omkar",
    from: 10,
    to: 11,
    milestoneId: "ms-operational",
    priority: "p1"
  },
  {
    n: 80,
    name: "Establish quality / energy / downtime / cost baseline",
    owner: "Omkar",
    from: 10,
    to: 11,
    milestoneId: "ms-operational",
    priority: "p1"
  },
  {
    n: 81,
    name: "Internal readiness audit",
    owner: "Akshay",
    from: 11,
    to: 11,
    milestoneId: "ms-operational",
    priority: "p1"
  },
  {
    n: 82,
    name: "Commissioning punch-list closure",
    owner: "Hanumanat",
    from: 11,
    to: 12,
    milestoneId: "ms-operational",
    priority: "p1"
  },
  {
    n: 85,
    name: "Customer trials / demonstrations",
    owner: "Akshay",
    from: 11,
    to: 12,
    milestoneId: "ms-operational",
    priority: "p1"
  },
  {
    n: 86,
    name: "Alpha v1 operating SOP freeze",
    owner: "Akshay",
    from: 11,
    to: 12,
    milestoneId: "ms-operational",
    priority: "p1"
  },
  {
    n: 87,
    name: "Digital architecture v1 freeze",
    owner: "Omkar",
    from: 11,
    to: 12,
    milestoneId: "ms-operational",
    priority: "p1"
  },
  {
    n: 88,
    name: "Maintenance plan v1 freeze",
    owner: "Hanumanat",
    from: 11,
    to: 12,
    milestoneId: "ms-operational",
    priority: "p1"
  },
  {
    n: 89,
    name: "Month 4–6 CED / Digital Twin roadmap",
    owner: "Omkar",
    from: 12,
    to: 12,
    milestoneId: "ms-operational",
    priority: "p2"
  },
  {
    n: 90,
    name: "VOLTRON ALPHA v1 OPERATIONAL",
    owner: "Omkar",
    from: 12,
    to: 12,
    milestoneId: "ms-operational",
    priority: "p0"
  }
];

function newSeedId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function daysFromReference(iso: string, referenceStart: string, planStart: string): string {
  const offset = Math.round(
    (new Date(`${iso}T00:00:00`).getTime() - new Date(`${referenceStart}T00:00:00`).getTime()) /
      86400000
  );
  return addDays(planStart, offset);
}

/** Clone Alpha 90-day structure onto a new plan start (0% progress, new ids). */
export function buildAlphaPlan(planStart: string): { milestones: Milestone[]; workstreams: Workstream[] } {
  const referenceStart = "2026-08-15";
  const milestoneIdMap = new Map<string, string>();

  const milestones = MILESTONES.map((ms) => {
    const id = newSeedId("ms");
    milestoneIdMap.set(ms.id, id);
    return {
      id,
      name: ms.name,
      owner: ms.owner,
      startDate: daysFromReference(ms.startDate, referenceStart, planStart),
      endDate: daysFromReference(ms.endDate, referenceStart, planStart),
      status: "not_started" as ProjectStatus
    };
  });

  const byN = [...SEED_TASKS].sort((a, b) => a.n - b.n);
  const workstreams = byN.map((task) => {
    const startDate = addDays(planStart, (task.from - 1) * 7);
    const endDate = addDays(planStart, (task.to - 1) * 7 + 6);
    return {
      id: newSeedId("ws"),
      name: task.name,
      owner: task.owner,
      startDate,
      endDate,
      progressPct: 0,
      status: "not_started" as ProjectStatus,
      priority: task.priority,
      milestoneId: milestoneIdMap.get(task.milestoneId) ?? null,
      blockReason: null
    };
  });

  return { milestones, workstreams };
}

function buildWorkstreams(): Workstream[] {
  const byN = [...SEED_TASKS].sort((a, b) => a.n - b.n);
  if (byN.length !== 90 || byN.some((t, i) => t.n !== i + 1)) {
    throw new Error("SEED_TASKS must contain tasks 1–90 exactly once");
  }

  return byN.map((task) => {
    const { startDate, endDate } = weekRange(task.from, task.to);
    return {
      id: `ws-alpha-${String(task.n).padStart(2, "0")}`,
      name: task.name,
      owner: task.owner,
      startDate,
      endDate,
      progressPct: 0,
      status: "not_started" as ProjectStatus,
      priority: task.priority,
      milestoneId: task.milestoneId,
      blockReason: null
    };
  });
}

export const SEED_PROJECTS: Project[] = [
  {
    id: "proj-alpha-001",
    slug: "voltron-alpha",
    name: "Voltron Alpha",
    objective:
      "Deliver Voltron Alpha v1 in 90 days: incorporate, secure site, acquire and install the plant, bring SCADA/ERP/Voltron online, and reach operational readiness with controlled trials.",
    owner: "Omkar",
    team: ["Omkar", "Akshay", "Hanumanat"],
    startDate: "2026-08-15",
    targetDate: "2026-11-15",
    status: "not_started",
    workstreams: buildWorkstreams(),
    milestones: MILESTONES
  }
];
