import type { Metadata } from 'next';
import {Hero} from '@/components/brand/Hero';
import {HumanHeroArtwork} from '@/components/brand/HumanHeroArtwork';
import {Action,Intro,Section,SiteShell} from '@/components/brand/SiteShell';
import {CommonsStudy} from '@/components/commons/CommonsStudy';
import '../../home-surfaces.css';
import '../../supporting-pages.css';
import './commons.css';
export const metadata:Metadata={title:'Voltron Commons',description:'A developing direction for access, practical learning, interdisciplinary exchange and possibility beyond the company.'};
export default function CommonsPage(){return <SiteShell><div className="supporting-page commons-page">
 <Hero principles={['Access','Learning','Possibility']} className="human-story-hero" breadcrumb="Voltron Commons" eyebrow="Voltron Commons" title="Human progress should deepen alongside technological progress." illustration={<HumanHeroArtwork kind="commons"/>} primary="Explore the directions" href="#commons-directions" secondary="Explore a collaboration" secondaryHref="/partner?interest=commons#partnership">A developing direction for opening pathways to access, learning and possibility beyond the company.</Hero>
 <Section id="commons-directions"><Intro eyebrow="Access creates capability" title="Give access. Build agency.">Knowledge becomes more valuable when people can use it. Explore five directions for learning, practice and shared growth.</Intro><CommonsStudy kind="programs"/><p className="commons-qualification">Developing program directions. Concrete programs will take shape as Voltron grows.</p></Section>
 <Section id="shared-learning"><Intro eyebrow="Capability enables contribution" title="Learning beyond a single discipline.">Creative exchange, systems thinking, inquiry and time for reflection can strengthen a more capable and humane manufacturing future.</Intro><CommonsStudy kind="learning"/></Section>
 <Section id="participation"><Intro eyebrow="Contribution creates shared growth" title="From intention to participation.">Bring a question, a practice, or a possibility. Help shape how knowledge, industry and communities can grow together.</Intro><CommonsStudy kind="participation"/><div className="commons-invitation"><p>Concrete programs and collaborations will develop as Voltron grows. A conversation is a place to begin.</p><Action href="/partner?interest=commons#partnership">Explore a collaboration</Action></div></Section>
 </div></SiteShell>;}
