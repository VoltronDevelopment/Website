import type {AlphaLineState} from './alpha-line-timeline';
/** Reading emphasis follows the visible operation; recorded process history is not quality release. */
export function alphaEvidenceFocus(state:AlphaLineState){
 if(state.chapter==='route'||state.phase==='overview'||state.stationId==='LOAD')return 0;
 if(state.processingComplete)return 3;
 return state.phase==='hold'||state.phase==='drain'?2:1;
}
