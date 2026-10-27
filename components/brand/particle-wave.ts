/** Shared analytic transport. Absolute-time fields keep replay, seeking and posters identical.
 *  Locally authored from the reviewed motion principles; no legacy demo runtime is used. */
export const particleWaveGLSL = /* glsl */ `
vec3 latticeWave(vec3 target, float progress, float seed, float clock, vec3 direction, float reach, float amplitude) {
 float p=clamp(progress,0.,1.),free=1.-p;
 vec3 axis=normalize(direction),side=normalize(cross(axis,abs(axis.y)>.9?vec3(0.,0.,1.):vec3(0.,1.,0.))),up=cross(side,axis);
 float lane=floor(seed*3.)-1.;
 float phase=dot(target,side)*2.4+dot(target,up)*1.3-clock*1.6+lane*.9;
 float envelope=free*free*(.55+.45*sin(p*3.14159265));
 vec3 ribbon=side*(sin(phase)*.62+lane*.30)+up*(cos(phase*.73+lane)*.40+sin(phase*1.37)*.16);
 return target-axis*reach*pow(free,1.3)+ribbon*amplitude*envelope;
}
vec3 latticeRelease(vec3 target,float progress,float seed,float clock,vec3 direction,float reach,float amplitude) {
 float p=clamp(progress,0.,1.);vec3 axis=normalize(direction);
 vec3 side=normalize(cross(axis,abs(axis.y)>.9?vec3(0.,0.,1.):vec3(0.,1.,0.))),up=cross(side,axis);
 float phase=dot(target,side)*2.8+clock*1.8+floor(seed*3.)*.8;
 return target+axis*reach*(p*.35+p*p*.65)+(side*sin(phase)+up*cos(phase*.73))*(amplitude*sin(p*3.14159265));
}
`;

/** Broader, slower-looking ribbons for the Home story without changing approved sibling scenes. */
export const homeParticleWaveGLSL=particleWaveGLSL
 .replace('free*free*(.55+.45*sin(p*3.14159265))','pow(free,1.4)*(.65+.35*sin(p*3.14159265))')
 .replace('sin(phase)*.62+lane*.30','sin(phase)*.78+lane*.38')
 .replace('cos(phase*.73+lane)*.40+sin(phase*1.37)*.16','cos(phase*.73+lane)*.48+sin(phase*1.37)*.22');

/** A visibly long three-ribbon source, then continuous convergence into sampled surfaces. */
export const longParticleWaveGLSL=homeParticleWaveGLSL+/* glsl */`
vec3 latticeLongWave(vec3 target,float progress,float seed,float clock,vec3 direction,float reach,float amplitude){
 vec3 axis=normalize(direction),side=normalize(cross(axis,abs(axis.y)>.9?vec3(0.,0.,1.):vec3(0.,1.,0.))),up=cross(side,axis);
 float lane=floor(seed*3.)-1.,along=fract(seed*13.713),phase=along*8.5-clock*.7+lane*.26;
 vec3 ribbon=axis*(dot(target,axis)-reach*(1.-along))
  +side*(sin(phase)*amplitude+lane*.13)+up*(cos(phase*.76)*amplitude*.42+lane*.055);
 float p=clamp(progress,0.,1.);return mix(ribbon,target,p*p*(3.-2.*p));
}
vec3 latticeLongRelease(vec3 target,float progress,float seed,float clock,vec3 direction,float reach,float amplitude){
 vec3 axis=normalize(direction),side=normalize(cross(axis,vec3(0.,1.,0.))),up=cross(side,axis);
 float p=clamp(progress,0.,1.),along=fract(seed*13.713),phase=along*8.5-clock*.7;
 vec3 ribbon=axis*(dot(target,axis)+reach*(p*.3+p*p*.7)+along*reach*.5)
  +side*sin(phase)*amplitude+up*cos(phase*.76)*amplitude*.42;
 return mix(target,ribbon,p*p*(3.-2.*p));
}
float latticeSheetCrest(float seed,float clock){
 float along=fract(seed*13.713),across=fract(seed*7.919);
 float phase=along*6.2831853*2.35-clock*1.05;
 return sin(phase)*.72+sin(phase*.47+across*2.1)*.28;
}
vec3 latticeSheetWave(vec3 target,float progress,float seed,float clock,vec3 direction,float reach,float amplitude){
 vec3 axis=normalize(direction),side=normalize(cross(axis,abs(axis.y)>.9?vec3(0.,0.,1.):vec3(0.,1.,0.))),up=cross(side,axis);
 float along=fract(seed*13.713),across=fract(seed*7.919),lane=floor(seed*5.)-2.;
 float jitter=(fract(seed*91.7)-.5)*.045,rowDelay=across*.22+abs(lane)*.035;
 float p=smoothstep(rowDelay,min(1.,rowDelay+.62),clamp(progress,0.,1.)),ease=p*p*(3.-2.*p);
 vec3 sheet=axis*(dot(target,axis)-reach*(1.-along))+side*((across-.5)*amplitude*1.65+lane*.07+jitter)+up*(latticeSheetCrest(seed,clock)*amplitude+jitter);
 return mix(sheet,target,ease);
}
`;
