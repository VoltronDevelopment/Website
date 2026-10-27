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
