import type {CSSProperties} from 'react';
import {agentPresets} from './agent-presets';
import './agent-aura.css';

export function AgentCloudPoster({agent, featured = false}: {agent: number; featured?: boolean}) {
  const preset = agentPresets[agent];
  return <>
    <span
      aria-hidden="true"
      className="agent-cube-aura"
      data-agent={preset.name}
      style={{'--aura-color': preset.aura} as CSSProperties}
    />
    <span className="agent-cloud-poster" aria-hidden="true">
      {(['light', 'dark'] as const).map(theme => {
        const base = '/agent-clouds/' + agent + '-' + theme;
        return <img key={theme} className={'art-theme-' + theme} src={base + '-small.webp'}
          srcSet={base + '-small.webp 384w, ' + base + '.webp 1024w'}
          sizes={featured ? '(max-width:767px) 145px, 330px' : '(max-width:767px) 145px, 200px'}
          alt="" width="1024" height="1024" loading="lazy" decoding="async"/>;
      })}
    </span>
  </>;
}
