export const capabilities=[
 ['Observation','Recognize what is happening before deciding what to change.'],
 ['Analysis','Connect observations with their context and supporting evidence.'],
 ['Engineering','Turn understanding into dependable, workable systems.'],
 ['Craft','Make the detail understandable and useful to the next person.'],
 ['Judgment','Choose responsibly, with the limits of the evidence in view.'],
 ['Imagination','Explore alternatives and test them against reality.'],
 ['Collaboration','Combine different perspectives through shared understanding.'],
 ['Learning','Improve through experience, feedback and reflection.'],
] as const;
export const principleCapabilities=[[0,1,7],[3,2],[4,1],[5,2],[6,7]];
export const capabilityAngle=(index:number)=>index*Math.PI/4+Math.PI/8;
