import {ReplayableStudy} from '@/components/brand/ReplayableStudy';
import type {Metadata} from 'next';
import {Leadership} from '@/components/about/Leadership';
import {CollaborationHero} from '@/components/brand/CollaborationHero';
import {Hero} from '@/components/brand/Hero';
import {Action,Intro,Section,SiteShell} from '@/components/brand/SiteShell';
import {voltronRoadmap} from '@/lib/voltron-roadmap';
import {AboutStudy} from '@/components/about/AboutStudy';
import '../home-surfaces.css';
import '../supporting-pages.css';
import './about.css';
export const metadata:Metadata={title:'About Voltron Lattice',description:'Building industrial capability and advancing human possibility through manufacturing, engineering, connected intelligence and shared practice.'};
export default function AboutPage(){return <SiteShell><div className="supporting-page about-page">
<Hero eyebrow="About Voltron" title="The people behind Voltron" keywords="Engineering · Craft · Judgment" illustration={<CollaborationHero kind="about"/>} primary="How we work" href="#culture" secondary="Build with us" secondaryHref="/partner"/>
<Section id="culture"><Intro eyebrow="How we work" title="Depth in the work. Care in the details.">The eight cubes around the head represent capabilities our people develop through practice. Select one to see how it shapes the work.</Intro><ReplayableStudy inline label="capabilities"><AboutStudy kind="principles"/></ReplayableStudy></Section>
<Section id="leadership"><div className="about-leadership"><Intro eyebrow="Leadership" title="Accountability begins with people.">An industrial company develops through the decisions its people make and the responsibility they take.</Intro><Leadership/></div></Section>
<Section className="about-roadmap-section" id="roadmap"><Intro eyebrow="Our long-term direction" title="Build capability. Earn trust. Create original products.">Process capability, connected intelligence and quality come first. Original products and global competitiveness follow demonstrated readiness. Milestones are ambitions, measured from the start of operations.</Intro><div className="about-readiness"><p>Progress is earned through evidence: dependable processes, qualified products and the responsibility to support them.</p><details><summary>Evidence for progression</summary><ol>{voltronRoadmap.map(milestone=><li key={milestone.years}><p className="eyebrow">{milestone.years} · Intended stage</p><h3>{milestone.title}</h3><p>{milestone.detail}</p><p><strong>Readiness to advance</strong> {milestone.gate}</p><ul>{milestone.evidence.map(item=><li key={item}>{item}</li>)}</ul></li>)}</ol></details><Action href="/#roadmap" text>Explore the ten-year direction</Action></div></Section>
<Section><Intro eyebrow="Build the next chapter" title="Build with us. Extend what is possible."/><div className="about-destinations"><article><p className="eyebrow">Industrial collaboration</p><h3>Partner With Us</h3><p>Bring a production requirement, factory opportunity or capability you want to develop.</p><Action href="/partner" text>Start a conversation</Action></article><article><p className="eyebrow">Access and learning</p><h3>Voltron Commons</h3><p>Explore a developing direction for learning, participation and possibility beyond the company.</p><Action href="/about/voltron-commons" text>Explore the Commons</Action></article></div></Section>
</div></SiteShell>;}
