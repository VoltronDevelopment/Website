import {ReplayableStudy} from '@/components/brand/ReplayableStudy';
import type { Metadata } from 'next';
import {Hero} from '@/components/brand/Hero';
import {HumanHeroArtwork} from '@/components/brand/HumanHeroArtwork';
import {Action,Intro,Section,SiteShell} from '@/components/brand/SiteShell';
import {CommonsStudy} from '@/components/commons/CommonsStudy';
import {commonsStudies} from '@/components/commons/commons-content';
import '../../home-surfaces.css';
import '../../supporting-pages.css';
import './commons.css';

export const metadata:Metadata={title:'Voltron Commons',description:'Explore manufacturing, exchange perspectives and help shape developing directions for access, learning and shared progress.'};
export default function CommonsPage(){return <SiteShell><div className="supporting-page commons-page">
 <Hero principles={['Access','Learning','Possibility']} className="human-story-hero commons-workshop-hero" breadcrumb="Voltron Commons" eyebrow="Voltron Commons" title="Human progress should deepen alongside technological progress." illustration={<HumanHeroArtwork kind="commons"/>} primary="Explore and learn" href="#commons-directions" secondary="Explore a collaboration" secondaryHref="/partner?interest=commons#partnership">Knowledge grows when another person can use it, question it and add something of their own.</Hero>
 <Section id="commons-directions"><Intro eyebrow="Access creates capability" title="Give access. Build agency.">Begin with something you can explore today. Find the inspection feature in a field book, then follow the same panel through the connected factory.</Intro><ReplayableStudy label="resources"><CommonsStudy kind="resources"/></ReplayableStudy></Section>
 <Section id="shared-learning"><Intro eyebrow="Capability enables contribution" title="Learning beyond a single discipline.">Follow a sketch from the page to a formed surface, then see the observation added to the original drawing.</Intro><ReplayableStudy label="learning"><CommonsStudy kind="learning"/></ReplayableStudy></Section>
 <Section id="developing-directions"><Intro title="More ways to learn">Three pathways in development.</Intro><div className="commons-participation">{commonsStudies.programs.slice(0,3).map(([title,,text])=><article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div></Section>
 <Section id="participation"><Intro eyebrow="Contribution creates shared growth" title="Bring a question, a practice, or a possibility.">A conversation can begin with something you already know, something you want to understand or a place you want to help.</Intro><div className="commons-participation">{commonsStudies.participation.map(([title,heading,text])=><article key={title}><div className="desktop-story-details"><h3>{title}</h3><p>{text}</p></div><details className="mobile-story-details"><summary>{title}</summary><p>{text}</p></details></article>)}</div><div className="commons-invitation"><p>Explore how your experience, research or community initiative could contribute to Commons.</p><Action href="/partner?interest=commons#partnership">Explore a collaboration</Action></div></Section>
 </div></SiteShell>;}
