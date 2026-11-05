import * as THREE from 'three';
export function createAlphaBathSurface(index:number){
    return new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      uniforms: { uTime: { value: 0 }, uImpact: { value: 0 }, uDark: { value: 0 }, uTone: { value: index === 1 ? .48 : 1 } },
      vertexShader: `varying vec2 vUv; uniform float uTime; uniform float uImpact;
        void main(){vUv=uv; vec3 p=position; p.z+=sin(p.x*7.+uTime*.8)*cos(p.y*6.-uTime*.6)*(.0015+uImpact*.01); gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
      fragmentShader: `varying vec2 vUv; uniform float uTime; uniform float uImpact; uniform float uDark; uniform float uTone;
        void main(){vec2 p=(vUv-.5)*vec2(1.28,1.); float r=length(p);
          float ring=sin(r*48.-uTime*5.)*.5+.5; ring=pow(ring,7.)*exp(-r*5.5)*uImpact;
          float wave=sin(p.x*11.+sin(p.y*6.)*.4+uTime*.35)*cos(p.y*9.-uTime*.3);
          float reflection=pow(clamp(.52+wave*.25+sin(p.x*4.-p.y*3.)*.12,0.,1.),6.);
          float edge=1.-smoothstep(0.,.035,min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y)));
          vec3 base=mix(vec3(.025,.38,.62),vec3(.025,.19,.32),uDark)*uTone;
          vec3 color=base+vec3(.32,.34,.34)*(reflection*.22+ring*.6+edge*.2);
          gl_FragColor=vec4(color,.78);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });

}
