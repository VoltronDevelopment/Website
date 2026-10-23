import { alphaLineConnections, alphaLineDemo, alphaLineStation } from "./alpha-line-config";
import type { AlphaLineState } from "./alpha-line-timeline";

export type AlphaLineView = "execution" | "context" | "intelligence";

export type AlphaLineStoryRow = { label: string; value: string };

const deviationSteps = [
  {
    operation: "Condition outside the configured requirement",
    equipment: "Hoist holding above the station. No command has been issued.",
    question: "Which station is outside its configured requirement?",
    evidence: "A demonstration measurement at this station sits outside the approved range.",
    response: "Outline the station and keep the lot attached to this operation.",
  },
  {
    operation: "Illustrative playback paused",
    equipment: "The carrier stays where it is. The line has not been commanded.",
    question: "Why has the carrier stopped?",
    evidence: "The pause belongs to this demonstration lot and this station.",
    response: "Hold the playback so the condition can be read with the lot.",
  },
  {
    operation: "Event linked to the selected lot",
    equipment: "Hoist still paused above the affected station.",
    question: "Which lot and operation own this condition?",
    evidence: `${alphaLineDemo.lot}, ${alphaLineDemo.carrier}, and this station share one record.`,
    response: "Investigate this lot. Do not open an unrelated case.",
  },
  {
    operation: "Concern explained from the available evidence",
    equipment: "Hoist still paused. Physical control has not changed.",
    question: "What is the concern, and which evidence supports it?",
    evidence: "The demonstration reading is outside the approved recipe window for this operation.",
    response: "Cite that evidence. Do not change the bath from this page.",
  },
  {
    operation: "Proposed action waiting for a person",
    equipment: "Hoist still paused. The proposal is not an equipment command.",
    question: "What should an authorised person review?",
    evidence: "The same measurement, the approved recipe and the still-open inspection.",
    response: "Propose a hold for authorised human review.",
  },
  {
    operation: "Recorded outcome",
    equipment: "The hoist remains paused. The recorded hold was a human decision.",
    question: "What was decided, and how was it checked?",
    evidence: "An authorised person recorded the hold. A verification note was added to the lot.",
    response: "Show that outcome. Quality disposition stays open. Dispatch has not started.",
  },
] as const;

function stationName(id: string) {
  return alphaLineStation(id).name;
}

function operation(state: AlphaLineState) {
  const name = stationName(state.stationId);
  if (state.chapter === "route") return "Complete route";
  if (state.phase === "overview") return "Complete plant overview";
  if (state.phase === "pickup-lower") return "Lowering the empty fixture";
  if (state.phase === "attach") return "Attaching the component";
  if (state.phase === "pickup-raise") return "Lifting from the loading support";
  if (state.chapter === "loading") return `${name} · Receiving the lot`;
  if (state.chapter === "verification") return `${name} · Quality checkpoint`;
  if (state.phase === "descend") return "Lowering onto the receiving support";
  if (state.phase === "support") return "Component supported · Releasing next";
  if (state.phase === "release") return "Releasing and raising the empty fixture";
  if (state.phase === "finished") return "Finished component on the receiving support";
  if (state.chapter === "unloading") return `${name} · Moving toward unloading`;
  if (state.chapter === "review") return `${name} · Lot remaining for review`;
  if (state.phase === "turn") return "Corner transfer · Aligning the carrier";
  if (state.phase === "drain") return `${name} · Draining above the bath`;
  if (state.phase === "travel") return `${name} · Travelling`;
  if (state.phase === "lower") return "Lowering into the bath";
  if (state.phase === "hold") return "Immersed · Treatment in progress";
  if (state.phase === "raise") return "Raising from the bath";
  return name;
}

function evidence(state: AlphaLineState) {
  if (state.chapter === "loading") return "Lot identity is open. Inspection has not started.";
  if (state.chapter === "verification") return "Inspection requirements are open. Results are incomplete.";
  if (state.processingComplete || state.chapter === "review") return "Process history is available. Inspection is pending.";
  return "Process history is accumulating. Inspection has not started.";
}

export function alphaLineStory(state: AlphaLineState, view: AlphaLineView): { rows: AlphaLineStoryRow[] } {
  const step = state.deviationStep === null ? null : deviationSteps[state.deviationStep];
  if (view === "execution") {
    return {
      rows: [
        { label: "Current station", value: state.chapter === "route" ? "Complete line" : stationName(state.stationId) },
        { label: "Operation", value: step ? step.operation : operation(state).replace(`${stationName(state.stationId)} · `, "") },
        { label: "Route", value: state.chapter === "route" ? "13 treatment stations" : state.stationId.startsWith("T") ? `${Number(state.stationId.slice(1))} of 13` : state.stationId === "LOAD" ? "Receiving the lot" : "13 of 13 · Complete" },
        { label: "Quality", value: "Inspection pending" },

      ],
    };
  }
  if (view === "context") {
    const disposition = state.processingComplete ? " Dispatch not started." : "";
    return {
      rows: [
        { label: "Lot", value: `${alphaLineDemo.lot} · ${alphaLineDemo.part} · quantity ${alphaLineDemo.quantity}` },
        { label: "Route", value: alphaLineDemo.route },
        { label: "Connected context", value: `${alphaLineDemo.recipe}. ${alphaLineDemo.dwell}. ${alphaLineDemo.measurements}.` },
        { label: "Evidence", value: step ? step.evidence : `${evidence(state)}${disposition}` },
      ],
    };
  }
  return {
    rows: [
      { label: "Question", value: step ? step.question : state.chapter === "verification" ? "What inspection evidence is still open for this lot?" : "Is this operation inside its configured requirement?" },
      { label: "Evidence", value: step ? step.evidence : evidence(state) },
      { label: "Proposed response", value: step ? step.response : state.chapter === "verification" ? "Keep the checkpoint open. Unloading does not close quality or dispatch." : "No governed action. Continue this demonstration route." },
    ],
  };
}

export { alphaLineConnections, alphaLineDemo };
