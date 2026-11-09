import { Activity, BookOpen, Boxes, BrainCircuit, ClipboardCheck, Factory, GitBranch, Globe, Handshake, Inbox, KeyRound, ListChecks, Network, PanelsLeftRight, Route, Scale, Search, Settings, Users, Waypoints, Wrench, type LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = {
  People: Users, Manufacturing: Factory, Intelligence: BrainCircuit,
  Execution: Settings, Signals: Activity, Knowledge: BookOpen,
  Gather: Inbox, Compare: PanelsLeftRight, Review: ClipboardCheck,
  Treatment: Boxes, Inspection: Search, Traceability: Route,
  Plants: Factory, Partners: Handshake, Reach: Globe,
  Engineering: Settings, Craft: Wrench, Judgment: Scale,
  Access: KeyRound, Learning: BookOpen, Possibility: GitBranch,
  Programs: ListChecks, Factories: Factory, Collaboration: Network,
};

export function HeroTags({ keywords }: { keywords: string }) {
  return <ul className="hero-tags container" aria-label="Page themes">
    {keywords.split("·").map(word => {
      const label = word.trim();
      const Icon = icons[label] ?? Waypoints;
      return <li key={label}><Icon aria-hidden="true" size={20} strokeWidth={1.5}/><span>{label}</span></li>;
    })}
  </ul>;
}
