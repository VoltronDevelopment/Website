import * as T from 'three';
export type AlphaBox=(parent:T.Group,size:number[],position:number[],material:T.Material,soft?:boolean)=>T.Mesh;
/** Shared dimensions and surfaces from the approved three-tank equipment. */
export function createAlphaTankShell(group:T.Group,box:AlphaBox,geometry:<G extends T.BufferGeometry>(g:G)=>G,m:{metal:T.Material;polished:T.Material;steelDark:T.Material;back:T.Material;front:T.Material;side:T.Material},feet=false){
 box(group,[3.13,.16,2.63],[0,.38,0],m.metal,true);
 box(group,[3.04,1.57,.07],[0,1.22,-1.19],m.back);
 const front=box(group,[3.04,1.57,.035],[0,1.22,1.21],m.front);front.renderOrder=5;
 for(const x of [-1.51,1.51]){const pane=box(group,[.035,1.57,2.38],[x,1.22,0],m.side);pane.renderOrder=4;for(const z of [-1.21,1.21])box(group,[.065,1.66,.065],[x,1.24,z],m.polished);}
 for(const z of [-1.24,1.24]){box(group,[3.19,.1,.105],[0,2.065,z],m.polished,true);box(group,[3.18,.045,.06],[0,.47,z],m.steelDark);}
 for(const x of [-1.55,1.55])box(group,[.105,.1,2.48],[x,2.065,0],m.polished,true);
 const bolt=geometry(new T.CylinderGeometry(.035,.035,.035,8));for(const x of [-1.38,1.38])for(const y of [.66,1.77]){const mesh=new T.Mesh(bolt,m.polished);mesh.rotation.x=Math.PI/2;mesh.position.set(x,y,1.245);group.add(mesh);}
 if(feet)for(const x of [-1.36,1.36])for(const z of [-1.05,1.05])box(group,[.18,.12,.22],[x,.24,z],m.steelDark,true);
}

/** Authored Alpha trolley housing and wheel spacing, shared by full and compact lines. */
export function createAlphaTrolleyBody(group:T.Group,box:AlphaBox,geometry:<G extends T.BufferGeometry>(g:G)=>G,m:{metal:T.Material;steelDark:T.Material;polished:T.Material}){
 box(group,[.64,.16,1.65],[0,5.48,0],m.metal,true);box(group,[.44,.32,.43],[0,5.29,0],m.steelDark,true);box(group,[.49,.17,.47],[0,5.23,0],m.polished,true);
 const wheelGeometry=geometry(new T.CylinderGeometry(.13,.13,.09,20)),boltGeometry=geometry(new T.CylinderGeometry(.035,.035,.035,8));const wheels:T.Mesh[]=[];
 for(const x of [-.23,.23])for(const z of [-.69,.69]){const wheel=new T.Mesh(wheelGeometry,m.steelDark);wheel.rotation.x=Math.PI/2;wheel.position.set(x,5.46,z);group.add(wheel);wheels.push(wheel);const bolt=new T.Mesh(boltGeometry,m.polished);bolt.rotation.x=Math.PI/2;bolt.position.set(x,5.46,z+.06);group.add(bolt);}return wheels;
}
