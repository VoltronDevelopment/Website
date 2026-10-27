// Illustrative records, never live production data or approval authority.
export const ontologySubject = { part: "Flange housing", lot: "VL-042", operation: "Surface treatment" };
export const ontologyNodes = [
  { id: "part", label: "Part", record: "Flange housing", x: 15, y: 16, detail: "The part identity stays attached to its drawing revision and the lots made against it.", evidence: "Part identity · drawing revision · material" },
  { id: "process", label: "Process history", record: "Surface treatment", x: 15, y: 50, detail: "The operation connects what was planned with the conditions and events recorded during execution.", evidence: "Operation · event time · recorded conditions" },
  { id: "equipment", label: "Equipment", record: "Treatment line", x: 15, y: 84, detail: "Equipment records relate to the operations, conditions and lots they actually affected.", evidence: "Equipment identity · operation · affected lot" },
  { id: "lot", label: "Lot", record: "VL-042", x: 50, y: 50, detail: "A lot connects its part, process history, equipment, requirements and evidence. Its identity persists as work progresses.", evidence: "One lot identity · connected manufacturing history" },
  { id: "requirements", label: "Requirements", record: "Approved specification", x: 85, y: 16, detail: "The applicable specification gives an inspection its meaning. A result remains linked to the requirement and revision it was assessed against.", evidence: "Requirement · revision · acceptance criteria" },
  { id: "evidence", label: "Evidence", record: "Inspection record", x: 85, y: 84, detail: "Evidence retains the requirement, subject and manufacturing situation it supports. A result alone does not authorize a release.", evidence: "Result · requirement · subject · accountable review" },
] as const;
export type OntologyNodeId = typeof ontologyNodes[number]["id"];
export const ontologyConnections = [
  ["lot", "part"], ["lot", "process"], ["lot", "equipment"], ["lot", "requirements"], ["lot", "evidence"], ["equipment", "process"], ["evidence", "requirements"],
] as const satisfies readonly (readonly [OntologyNodeId, OntologyNodeId])[];
export const accountableStages = [
  { title: "Request", record: "Change request", owner: "Requester", detail: "Record what is proposed and the manufacturing situation it affects.", evidence: "Proposed change · affected part, lot and operation" },
  { title: "Review", record: "Impact and feasibility", owner: "Responsible reviewers", detail: "The responsible people assess the evidence, implications and limits.", evidence: "Impact assessment · supporting evidence · review outcome" },
  { title: "Commit", record: "Approved context", owner: "Authorised decision owner", detail: "The authorised decision establishes the permitted scope of action.", evidence: "Decision · permitted scope · responsible identity" },
  { title: "Verify", record: "Execution evidence", owner: "Responsible verifier", detail: "Evidence confirms what happened and connects it to the approved context.", evidence: "Execution record · result · approved context" },
] as const;
