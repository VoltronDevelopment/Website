---
id: "VL-FOUNDATIONS"
title: "Industrial concepts in plain language"
version: "1.0"
as_of: "2026-11-11"
classification: "public_safe"
ingest: true
approval_status: "approved"
claim_status: "general_education"
source_ids: ["NIST-AMS-400-2", "KRITZINGER-2018", "NIST-SP-800-82-R3", "ISA-95", "W3C-OWL-PRIMER", "NIST-DIGITAL-THREAD"]
aliases: []
related_ids: ["VL-VOS", "VL-ONTOLOGY"]
illustrative_sections: ["One batch through the coating line"]
section_aliases: {"Digital twin": ["digital twin", "twin", "twin vs simulation"], "Twin levels and data flow": ["levels of a twin", "levels of twin", "twin levels", "levels of digital twin", "digital shadow", "twin maturity", "bidirectional twin"], "SCADA and PLC": ["SCADA", "PLC", "supervisory control", "programmable logic controller"], "Manufacturing execution system": ["MES", "manufacturing execution system", "production tracking"], "Manufacturing ontology": ["ontology", "manufacturing ontology", "shared meaning"], "Industrial historian": ["historian", "industrial historian", "time series"], "Digital thread": ["digital thread", "thread vs twin"], "One batch through the coating line": ["coating line example", "same example", "factory example"], "Voltron's public walkthrough": ["Voltron demo", "factory walkthrough", "Voltron twin", "V Twin", "V-Twin", "five applications"]}
section_references: {"Digital twin": "https://www.nist.gov/publications/use-case-scenarios-digital-twin-implementation-based-iso-23247", "Twin levels and data flow": "https://doi.org/10.1016/j.ifacol.2018.08.474", "SCADA and PLC": "https://csrc.nist.gov/pubs/sp/800/82/r3/final", "Manufacturing execution system": "https://www.isa.org/standards-and-publications/isa-standards/isa-95-standard", "Manufacturing ontology": "https://www.w3.org/TR/owl2-primer/", "Industrial historian": "https://csrc.nist.gov/pubs/sp/800/82/r3/final", "Digital thread": "https://www.nist.gov/programs-projects/digital-thread-manufacturing"}
---

# Industrial concepts in plain language

## Digital twin
A digital twin represents a particular physical asset, process or system and is kept in step with relevant information about it for a purpose. Think of a map that updates as a delivery moves. A coating-line twin could show where a batch is or replay its passage. Some twins support simulations or predictions. A standalone simulation can explore a what-if question without an ongoing connection to a particular physical line. A twin may use charts, tables or a model instead of a 3D picture. Update frequency and detail depend on the intended use.

## Twin levels and data flow
There is no universal ladder of twin levels. Kritzinger and colleagues classify data integration as a digital model with no automated exchange, a digital shadow with automatic updates from physical to digital, and a digital twin with automated exchange both ways. In a coating-line example, that could mean a manually updated model, a representation that updates as a batch moves, or a system that can also return authorized updates to the physical side. Two-way exchange does not imply autonomous machine control. Separately, ask what the representation can do: show current state, replay history, test a scenario or forecast a condition. A simulation can work offline, and a connected display does not automatically predict anything. These distinctions are not Voltron product tiers.

## SCADA and PLC
SCADA stands for Supervisory Control and Data Acquisition. Think of a control room's instrument panel. It collects equipment signals, displays status and alarms, and may allow authorized supervisory commands. A programmable logic controller, or PLC, is a controller close to the equipment that reads inputs and runs programmed machine logic. The PLC can run a conveyor sequence while SCADA shows whether the conveyor is running. SCADA primarily helps supervise equipment. A twin represents relevant state or behavior for a purpose. They can use some of the same data.

## Manufacturing execution system
A manufacturing execution system, or MES, coordinates and records production work. Think of a job tracker for the factory floor. It can show which batch should run next, which steps it has completed and what checks are recorded. SCADA might report a changing oven reading. MES can help identify the work order and batch at that step. Exact responsibilities vary by plant. A recorded result does not authorize release by itself.

## Manufacturing ontology
An ontology describes the kinds of things in a domain and the relationships that give them meaning. Think of a shared vocabulary with connections built in. This reading came from this sensor, on this oven, during this step, for this batch. The ontology defines the concepts and relationships used to express those facts. A database can store the readings and records, while an ontology helps systems interpret them consistently. A glossary defines words. An ontology also describes how the things they refer to relate. V-MO is Voltron's direction for shared manufacturing meaning. This does not imply a particular internal schema or standards compliance.

## Industrial historian
An industrial historian stores timestamped equipment readings and events so people can study how a process behaved over time. Think of a flight recorder for process signals. It might show yesterday's oven temperature trend. Identifying the batch in the oven may also require a production record and a reliable time or identity link. A twin can use that history alongside other information to represent or study the process.

## Digital thread
A digital thread links information across stages in the life of a product or process. Think of a trail that connects a drawing revision, the batch built to that revision and its inspection result. It helps someone trace why a requirement applied and where the result came from. An ontology can define what those links mean. A twin represents a particular asset or process and may use information carried by the thread.

## One batch through the coating line
Illustrative example: a batch of metal brackets moves through a coating line. The local controller runs equipment logic. SCADA shows readings and alarms. A historian keeps the readings over time. MES records the job and the batch's progress. An ontology defines the relationships among the batch, step, oven and reading. The digital thread links the requirement, work and inspection. A twin represents the line or batch state and may support replay or simulation. Keep using this example across turns unless the visitor introduces their own. The example describes roles, not a particular installation.

## Voltron's public walkthrough
The factory walkthrough shows five views around one lot: V MES for production records and release evidence, V Twin for process representation, V AI for specialist assistance, V-MO for shared meaning and SCADA for equipment visibility. A public process animation does not confirm a live feed, validated forecasting, write-back, certification or production availability. When asked which twin level it demonstrates, describe what the public view shows and state which data connections are unconfirmed.
