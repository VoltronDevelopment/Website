/** Shared geometry keeps animation paths on the exact block-edge ports. */
export const meaningBlocks=[
 {x:32,y:22,name:'Part',at:2},{x:90,y:22,name:'Operation',at:24},{x:148,y:22,name:'Equipment',at:29},
 {x:90,y:58,name:'Lot',at:2},{x:50,y:94,name:'Requirement',at:41},{x:130,y:94,name:'Evidence',at:44},
] as const;
export const meaningConnections=[
 {d:'M32 31 V58 H76',at:2},{d:'M90 31 V49',at:24},{d:'M148 31 V58 H104',at:29},
 {d:'M90 67 V76',at:37},{d:'M90 76 H50 V85',at:41},{d:'M90 76 H130 V85',at:44},
] as const;
export const evidenceRows=[22,58,94] as const;
export const investigationPorts={source:{x:16,y:48,width:28,height:20},evidenceX:76,evidenceWidth:28,response:{x:136,y:48,width:28,height:20},split:58,merge:122};
export const incomingEvidence=(y:number)=>`M58 58 V${y} H76`;
export const outgoingEvidence=(y:number)=>`M104 ${y} H122 V58`;
