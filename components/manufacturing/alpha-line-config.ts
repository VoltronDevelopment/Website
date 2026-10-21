/** Provisional Alpha line. Replace coordinates and names when the plant drawing is confirmed. */
export const alphaLinePitch = 3.45;
export const alphaLineFarZ = -alphaLinePitch * 2;
export const alphaLineNearZ = alphaLinePitch * 2;
export const alphaLineEndX = alphaLinePitch * 6;
export const alphaLineProvisional = true;

export const alphaLineVerificationId = "T13";
export const alphaLineDeviationId = "T06";
export const alphaLineCoatId = "T07";

export type AlphaLineKind = "load" | "tank" | "unload";

export type AlphaLineStation = {
  id: string;
  number: string;
  name: string;
  kind: AlphaLineKind;
  x: number;
  z: number;
  /** Tank body orientation. End-run tanks face along the short leg. */
  yaw: number;
};

const pad = (value: number) => String(value).padStart(2, "0");

function tank(index: number, x: number, z: number, yaw: number): AlphaLineStation {
  const number = pad(index);
  return { id: `T${number}`, number, name: `Tank ${number}`, kind: "tank", x, z, yaw };
}

export const alphaLineStations: readonly AlphaLineStation[] = [
  { id: "LOAD", number: "LD", name: "Loading", kind: "load", x: 0, z: alphaLineFarZ, yaw: 0 },
  tank(1, alphaLinePitch, alphaLineFarZ, 0),
  tank(2, alphaLinePitch * 2, alphaLineFarZ, 0),
  tank(3, alphaLinePitch * 3, alphaLineFarZ, 0),
  tank(4, alphaLinePitch * 4, alphaLineFarZ, 0),
  tank(5, alphaLinePitch * 5, alphaLineFarZ, 0),
  tank(6, alphaLineEndX, alphaLineFarZ + alphaLinePitch, -Math.PI / 2),
  tank(7, alphaLineEndX, alphaLineFarZ + alphaLinePitch * 2, -Math.PI / 2),
  tank(8, alphaLineEndX, alphaLineFarZ + alphaLinePitch * 3, -Math.PI / 2),
  tank(9, alphaLinePitch * 5, alphaLineNearZ, 0),
  tank(10, alphaLinePitch * 4, alphaLineNearZ, 0),
  tank(11, alphaLinePitch * 3, alphaLineNearZ, 0),
  tank(12, alphaLinePitch * 2, alphaLineNearZ, 0),
  tank(13, alphaLinePitch, alphaLineNearZ, 0),
  { id: "UNLOAD", number: "UL", name: "Unloading", kind: "unload", x: 0, z: alphaLineNearZ, yaw: 0 },
];

export function alphaLineStation(id: string): AlphaLineStation {
  const station = alphaLineStations.find(item => item.id === id);
  if (!station) throw new Error(`Unknown Alpha station ${id}`);
  return station;
}

export type AlphaLinePathPoint = {
  x: number;
  z: number;
  corner: boolean;
  stationId?: string;
};

export function alphaLinePath(): AlphaLinePathPoint[] {
  const points: AlphaLinePathPoint[] = [];
  for (const station of alphaLineStations) {
    if (station.id === "T06") points.push({ x: alphaLineEndX, z: alphaLineFarZ, corner: true });
    if (station.id === "T09") points.push({ x: alphaLineEndX, z: alphaLineNearZ, corner: true });
    points.push({ x: station.x, z: station.z, corner: false, stationId: station.id });
  }
  return points;
}

export const alphaLineDemo = {
  lot: "Demonstration lot",
  carrier: "Carrier 03",
  part: "Demonstration panel",
  quantity: "1",
  route: "Loading, Tanks 01–13, unloading",
  recipe: "Approved recipe · demonstration revision",
  dwell: "Required dwell · demonstration window",
  measurements: "Relevant measurements · demonstration values",
  note: "Demonstration data",
  boundary: "PLC and SCADA control the physical process. AI investigates and prepares governed actions.",
  arrangement: "Square-U layout, station functions and corner transfers are illustrative until the plant drawing is confirmed.",
};

export const alphaLineConnections = [
  { id: "scada", title: "SCADA / Edge", text: "Equipment state and measurements for the selected station." },
  { id: "historian", title: "Historian", text: "Recorded conditions over this operation’s time window." },
  { id: "erp", title: "ERP", text: "The lot, its route and the production execution record." },
  { id: "qms", title: "QMS", text: "Requirements, inspections and quality disposition for this lot." },
  { id: "vmo", title: "V-MO", text: "Shared identities, relationships and the actions that are permitted." },
  { id: "twin", title: "Twin", text: "A derived view of progress and compliance for this operation." },
  { id: "ai", title: "AI", text: "An investigation that uses the evidence already connected to this lot." },
] as const;

export const alphaLineChapters = [
  { id: "loading", label: "Loading" },
  { id: "processing", label: "Processing" },
  { id: "verification", label: "Verification" },
  { id: "unloading", label: "Unloading" },
  { id: "review", label: "Review" },
] as const;

export type AlphaLineJourneyChapter = (typeof alphaLineChapters)[number]["id"];
