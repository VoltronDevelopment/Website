import * as T from 'three';

type Point = [number, number, number];
type Own = <R extends {dispose(): void}>(resource: R) => R;

/** A body-free rolling chassis. Each wheel seats along its own hub axis. */
export function rollingChassis(subject: T.Group, own: Own, clip: T.Plane) {
  const finish = (color: number, roughness: number, metalness: number) =>
    own(new T.MeshStandardMaterial({color, roughness, metalness, clippingPlanes: [clip]}));
  const rail = finish(0x344b60, .42, .64);
  const alloy = finish(0xb2c7d7, .28, .72);
  const rubber = finish(0x151e29, .92, .04);
  const enamel = finish(0x246bd4, .35, .42);
  const rotor = finish(0x728b9f, .4, .7);
  const model = new T.Group();
  subject.add(model);
  const block = own(new T.BoxGeometry());
  const cylinder = own(new T.CylinderGeometry(1,1,1,12));
  function member(parent:T.Group, a:Point, b:Point, w:number, d:number, material:T.Material, round=false) {
    const start=new T.Vector3(...a), end=new T.Vector3(...b), axis=end.clone().sub(start);
    const mesh=new T.Mesh(round?cylinder:block,material);
    mesh.position.copy(start).lerp(end,.5);
    mesh.scale.set(w,axis.length(),d);
    mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),axis.normalize());
    parent.add(mesh);
  }
  for (const side of [-1,1]) {
    const z=side*.34;
    const path:Point[]=[[-1.45,.45,z],[-1.03,.47,z],[-.65,.29,z],[.61,.29,z],[1.01,.51,z],[1.43,.49,z]];
    path.slice(1).forEach((p,i)=>member(model,path[i],p,.11,.1,rail));
  }
  for(const [x,y] of [[-1.37,.46],[-.76,.34],[0,.29],[.76,.36],[1.36,.49]]) {
    member(model,[x,y,-.34],[x,y,.34],.09,.1,alloy);
  }
  member(model,[-.73,.31,-.32],[.73,.31,.32],.054,.06,rail);
  member(model,[-.73,.31,.32],[.73,.31,-.32],.054,.06,rail);
  member(model,[-1.01,.36,0],[1.02,.36,0],.045,.045,alloy,true);
  const diff=own(new T.SphereGeometry(1,16,10));
  for(const x of [-1.02,1.02]) {
    const housing=new T.Mesh(diff,rail);
    housing.position.set(x,.37,0);housing.scale.set(.17,.12,.15);model.add(housing);
  }
  // The forward rack connects the two steering knuckles, behind the axle line.
  member(model,[-.84,.38,-.36],[-.84,.38,.36],.045,.045,rail,true);
  for(const side of [-1,1]){
    member(model,[-.84,.38,side*.32],[-.87,.38,side*.52],.022,.022,alloy,true);
    member(model,[-.87,.38,side*.52],[-1.00,.38,side*.66],.018,.018,alloy,true);
    member(model,[1.28,.53,side*.34],[1.22,.56,side*.54],.075,.075,rail);
  }
  const gearbox=own(new T.CylinderGeometry(.13,.20,.42,12));
  gearbox.rotateZ(Math.PI/2);
  const transmission=new T.Mesh(gearbox,alloy);
  transmission.position.set(-.52,.41,0);model.add(transmission);
  for(let i=0;i<5;i++){
    member(model,[-.80+i*.058,.34,-.14],[-.80+i*.058,.34,.14],.021,.25,rotor);
  }
  // Ribbed sump and cam covers sit on the front mounts, ahead of the gearbox.
  const engine=new T.Group();engine.position.set(-.93,.54,0);model.add(engine);
  member(engine,[0,-.14,0],[0,.11,0],.36,.32,rail);
  for(const side of [-1,1]){
    member(engine,[-.16,.16,side*.10],[.16,.16,side*.10],.095,.11,alloy);
    member(engine,[0,-.04,side*.13],[0,-.07,side*.34],.08,.09,rail);
  }
  for(let i=0;i<5;i++)member(engine,[-.14+i*.07,-.10,-.18],[-.14+i*.07,-.10,.18],.022,.04,rotor);
  const tyre=own(new T.LatheGeometry([
    [.215,-.094],[.25,-.117],[.326,-.107],[.36,-.065],[.36,.065],[.326,.107],[.25,.117],[.215,.094],[.215,-.094],
  ].map(([r,y])=>new T.Vector2(r,y)),48));
  tyre.rotateX(Math.PI/2);
  const rim=own(new T.TorusGeometry(.213,.023,8,40));
  const brake=own(new T.CylinderGeometry(.157,.157,.034,32));brake.rotateX(Math.PI/2);
  const tread=own(new T.TorusGeometry(.358,.0055,6,48));
  const lug=own(new T.CylinderGeometry(.012,.012,.019,6));lug.rotateX(Math.PI/2);
  const coilPath=Array.from({length:85},(_,i)=>{
    const t=i/84,angle=t*12*Math.PI;
    return new T.Vector3(.055*Math.cos(angle),t*.31,.055*Math.sin(angle));
  });
  const spring=own(new T.TubeGeometry(new T.CatmullRomCurve3(coilPath),84,.012,6,false));
  const suspensions:{group:T.Group;side:number}[]=[];
  const wheels:{hub:T.Group;brakes:T.Group;side:number}[]=[];
  for(const x of [-1.02,1.02]) for(const side of [-1,1]) {
    const z=side*.67;
    const suspension=new T.Group();model.add(suspension);suspensions.push({group:suspension,side});
    for(const offset of [-.2,.2]) {
      member(suspension,[x+offset,.28,side*.31],[x,.245,z],.025,.025,alloy,true);
      member(suspension,[x+offset*.75,.52,side*.32],[x,.44,z],.022,.022,rail,true);
    }
    member(suspension,[x,.36,0],[x,.36,z],.032,.032,alloy,true);
    const strut=new T.Group();strut.position.set(x,.29,side*.55);strut.rotation.x=-side*.40;
    suspension.add(strut);strut.add(new T.Mesh(spring,enamel));
    member(strut,[0,0,0],[0,.34,0],.025,.025,alloy,true);
    member(suspension,[x,.60,side*.42],[x,.5,side*.32],.05,.05,rail,true);
    const hub=new T.Group();model.add(hub);hub.position.set(x,.36,z);
    const disc=new T.Mesh(brake,rotor);
    const brakes=new T.Group();brakes.position.set(x,.36,z);model.add(brakes);brakes.add(disc);
    member(brakes,[.117,-.065,0],[.117,.075,0],.056,.085,enamel);
    hub.add(new T.Mesh(tyre,rubber));
    for(const offset of [-.045,0,.045]){
      const band=new T.Mesh(tread,rubber);band.position.z=offset;hub.add(band);
    }
    const lip=new T.Mesh(rim,alloy);lip.position.z=side*.095;hub.add(lip);
    const centre=new T.Mesh(brake,alloy);centre.scale.set(.36,.36,1.4);centre.position.z=side*.10;hub.add(centre);
    for(let i=0;i<6;i++) {
      const angle=i*Math.PI/3,c=Math.cos(angle),s=Math.sin(angle);
      member(hub,[.04*c,.04*s,side*.1],[.209*Math.cos(angle+.16),.209*Math.sin(angle+.16),side*.09],.026,.025,alloy);
      const bolt=new T.Mesh(lug,rail);bolt.position.set(.038*c,.038*s,side*.133);hub.add(bolt);
    }
    wheels.push({hub,brakes,side});
  }
  model.rotation.set(0,-.30,0,'YXZ');
  model.scale.setScalar(.79);
  model.position.y=.15-new T.Box3().setFromObject(model,true).min.y;
  // Four machined saddles carry the frame so all wheel assemblies are visible.
  model.updateMatrix();
  for(const x of [-.72,.72]) for(const z of [-.34,.34]) {
    const saddle=new T.Vector3(x,.32,z).applyMatrix4(model.matrix);
    member(subject,[saddle.x,.025,saddle.z],saddle.toArray(),.055,.055,alloy,true);
    member(subject,[saddle.x-.095,.022,saddle.z],[saddle.x+.095,.022,saddle.z],.045,.15,rail);
  }
  return (time:number)=>{
    engine.position.y=.54+.42*(1-T.MathUtils.smoothstep(time,.08,.92));
    const suspensionSeat=T.MathUtils.smoothstep(time,.38,1.16);
    suspensions.forEach(({group,side})=>{group.visible=time>.38;group.position.z=side*.24*(1-suspensionSeat);});
    wheels.forEach(({hub,brakes,side})=>{
      const brakeSeat=T.MathUtils.smoothstep(time,1.08,1.83);
      brakes.visible=time>1.08; brakes.position.z=side*(.67+.17*(1-brakeSeat));
      const start=hub.position.x<0?1.9:3.1;
      const seated=T.MathUtils.smoothstep(time,start,start+1.22);
      hub.visible=time>=start-.2;
      hub.position.z=side*(.67+.48*(1-seated));
    });
  };
}
