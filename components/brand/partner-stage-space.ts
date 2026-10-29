import * as T from 'three';
import {partnerStage} from './partner-stage';
export const partnerPanelMatrix=new T.Matrix4().compose(new T.Vector3(...partnerStage.panel.center),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),partnerStage.panel.yaw),new T.Vector3(1,1,1));
export const partnerPanelInverse=partnerPanelMatrix.clone().invert();
export const partnerHandTargets=[new T.Vector3(-.65,-.02,.10),new T.Vector3(.50,.23,.17)].map(p=>p.applyMatrix4(partnerPanelMatrix));
