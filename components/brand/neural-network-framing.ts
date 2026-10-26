import type {PerspectiveCamera} from 'three';
import layout from '../../public/sculptures/neural-network.json';
/** A fixed viewpoint; changing FOV and off-axis projection only scales and centres the same perspective. */
export function frameNeuralCamera(camera:PerspectiveCamera,aspect:number){const fit=layout.camera.framing,tanY=Math.max(fit.minHeight/2,fit.minWidth/(2*aspect));camera.aspect=aspect;camera.fov=2*Math.atan(tanY)*180/Math.PI;camera.updateProjectionMatrix();camera.projectionMatrix.elements[8]=fit.centre[0]/(tanY*aspect);camera.projectionMatrix.elements[9]=fit.centre[1]/tanY;camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();}
