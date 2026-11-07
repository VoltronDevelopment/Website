import {BookOpen, Boxes, Compass, DoorOpen, Leaf, Lightbulb, ScanEye, Waypoints} from 'lucide-react';
import type { Metadata } from 'next';
import {Hero} from '@/components/brand/Hero';
import {HumanHeroArtwork} from '@/components/brand/HumanHeroArtwork';
import {Action,Intro,Section,SiteShell} from '@/components/brand/SiteShell';

import {commonsStudies} from '@/components/commons/commons-content';
import '../../home-surfaces.css';
import '../../supporting-pages.css';
import './commons.css';

export const metadata:Metadata={title:'Voltron Commons',description:'Explore manufacturing, exchange perspectives and help shape developing directions for access, learning and shared progress.'};
const cardIcons = {
 resources: [DoorOpen], learning: [Lightbulb, Waypoints, ScanEye, Leaf],
 programs: [BookOpen, Boxes, Compass], participation: [BookOpen, Waypoints, Leaf],
};
function CommonsCards({kind}:{kind:keyof typeof cardIcons}) {
 const items = kind === 'programs' ? commonsStudies.programs.slice(0,3) : commonsStudies[kind];
 return <div className="commons-participation commons-icon-cards">{items.map(([title,,description], index) => {
  const Icon = cardIcons[kind][index];
  return <article key={title}><Icon aria-hidden="true" size={24}/><h3>{title}</h3><p>{description}</p></article>;
 })}</div>;
}
export default function CommonsPage(){return <SiteShell><div className="supporting-page commons-page">
 <Hero className="human-story-hero commons-workshop-hero" breadcrumb="Voltron Commons" eyebrow="Voltron Commons" keywords="Access · Learning · Possibility" title="Voltron Commons" illustration={<HumanHeroArtwork kind="commons"/>} primary="Explore and learn" href="#commons-directions" secondary="Explore a collaboration" secondaryHref="/partner?interest=commons#partnership"/>
 <Section id="commons-directions"><Intro eyebrow="Access creates capability" title="Give access. Build agency.">Step inside the connected factory. Follow one lot through treatment and inspection, and open the records behind each decision.</Intro><CommonsCards kind="resources"/></Section>
 <Section id="shared-learning"><Intro eyebrow="Capability enables contribution" title="Learning beyond a single discipline.">Four ways to explore a question across disciplines.</Intro><CommonsCards kind="learning"/></Section>
 <Section id="developing-directions"><Intro title="More ways to learn">Three pathways in development.</Intro><CommonsCards kind="programs"/></Section>
 <Section id="participation"><Intro eyebrow="Contribution creates shared growth" title="Bring a question, a practice, or a possibility.">A conversation can begin with something you already know, something you want to understand or a place you want to help.</Intro><CommonsCards kind="participation"/><div className="commons-invitation"><p>Explore how your experience, research or community initiative could contribute to Commons.</p><Action href="/partner?interest=commons#partnership">Explore a collaboration</Action></div></Section>
 </div></SiteShell>;}
