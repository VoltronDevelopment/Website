/** Metres on the factory floor. Angles are measured from +X towards +Z. */
export const logisticsLayout = {
  dock: { x: -16, z: 0 }, truckX: -16.6,
  rack: { x: -10.7, z: 5.4 }, loadX: -4, loadZ: -4.998,
  outfeedZ: 4.95, forkCenter: 1.55,
} as const;

const {dock, rack, loadZ, outfeedZ, forkCenter} = logisticsLayout;
const quarter = Math.PI / 2;
const ease = (p:number) => { const t=Math.max(0, Math.min(1,p)); return t*t*(3-2*t); };
type Pose = {x:number; z:number; heading:number; distance:number};
type Leg = {start:number; end:number; from:Pose; length:number; turn:number};
const legs:Leg[] = [];
let cursor:Pose = {x:dock.x+3.55,z:dock.z,heading:Math.PI,distance:0};

// Integrate signed travel and steering together, including reverse arcs.
function along(from:Pose, length:number, turn:number, p:number):Pose {
  const heading = from.heading + turn*p;
  return {
    x: from.x + (turn ? length/turn*(Math.sin(heading)-Math.sin(from.heading)) : Math.cos(heading)*length*p),
    z: from.z + (turn ? length/turn*(Math.cos(from.heading)-Math.cos(heading)) : Math.sin(heading)*length*p),
    heading, distance:from.distance+length*p,
  };
}
function drive(start:number,end:number,length:number,turn=0) {
  legs.push({start,end,from:cursor,length,turn});
  cursor=along(cursor,length,turn,1);
}
const dockStop=dock.x+forkCenter;
drive(1,3,-dockStop+cursor.x);
drive(4,5.7,-(rack.x-1.1-dockStop));
drive(5.7,7.3,-1.1*quarter,-quarter);
drive(7.3,10.8,rack.z-forkCenter-cursor.z);
drive(11.7,13,-1.7);
drive(16,17.3,1.7);
drive(18.1,20,-(cursor.z-(loadZ+1.4)));
drive(20,21.65,-1.4*quarter,-quarter);
drive(21.65,23.4,-4-forkCenter-cursor.x);
// After the fixture takes the load, the same lift travels empty to the outfeed.
drive(25,28,-8.1-cursor.x);
drive(28,30,-quarter,-quarter);
drive(30,40,-(outfeedZ+1.1-cursor.z));
// Stay outside the outfeed until the shuttle has stopped and the load is accessible.
drive(68.6,70.1,1.1*quarter,quarter);
const pickupApproachX=cursor.x;
drive(70.1,70.8,-4-forkCenter-cursor.x);
drive(71.8,72.5,pickupApproachX-cursor.x);
drive(72.5,73.7,-1.1*quarter,-quarter);
drive(73.7,75.8,cursor.z-1.05);
drive(75.8,77.4,1.05*quarter,-quarter);
drive(77.4,79,cursor.x-dockStop);
drive(79.8,81.3,-1.8);

// Acceleration belongs to a manoeuvre. Tangent straight/arc joins keep their speed.
const trips: {start:number;end:number;length:number;legs:Leg[]}[]=[];
for(const leg of legs){
  const previous=trips[trips.length-1];
  if(previous?.end===leg.start&&Math.sign(previous.legs[0].length)===Math.sign(leg.length)){
    previous.end=leg.end;previous.length+=Math.abs(leg.length);previous.legs.push(leg);
  }else trips.push({start:leg.start,end:leg.end,length:Math.abs(leg.length),legs:[leg]});
}

export function factoryLogistics(time:number) {
  const trip=trips.find(item=>time<=item.end)??trips[trips.length-1];
  let distance=trip.length*ease((time-trip.start)/(trip.end-trip.start));
  let leg=trip.legs[0];
  for(const next of trip.legs){
    leg=next;
    if(distance<=Math.abs(leg.length)||leg===trip.legs[trip.legs.length-1])break;
    distance-=Math.abs(leg.length);
  }
  const fraction=Math.min(1,distance/Math.abs(leg.length));
  const pose=along(leg.from,leg.length,leg.turn,fraction);
  const change=(a:number,b:number)=>ease((time-a)/(b-a));
  const truckX=logisticsLayout.truckX-8*change(82,87);
  const door=1-change(12,13.2)+change(74,75.2)-change(81.3,82);
  const forkY=.63+.14*change(3,4)-.24*change(10.8,11.45)-.015*change(11.45,11.7)
    +.015*change(17.3,17.6)+.24*change(17.6,18.1)-.14*change(23.4,24)
    -.08*change(24,25)+.08*change(67,68)+.14*change(70.8,71.65)
    -.14*change(79,79.55)-.015*change(79.55,79.8);
  const tip={x:pose.x+forkCenter*Math.cos(pose.heading),z:pose.z+forkCenter*Math.sin(pose.heading)};
  const riding={...tip,y:forkY+.425};
  const inRack=time>=11.45&&time<17.6;
  const cargo={x:dock.x+truckX-logisticsLayout.truckX,z:dock.z,y:1.055};
  const receiving=time<3?cargo:inRack?{...rack,y:.955}:riding;
  const outgoing=time<70.8?{x:-4,z:2.498+(outfeedZ-2.498)*change(67,68.6),y:1.055}:time<79.55?riding:cargo;
  return {pose,steer:time>trip.start&&time<trip.end?Math.atan(-.8*leg.turn/leg.length):0,
    forkY,truckX,door,receiving,outgoing,inRack,
    inboundYaw:time<3?-Math.PI:inRack?-quarter:-pose.heading,
    outboundYaw:time<70.8?0:time>=79.55?Math.PI:-pose.heading};
}
