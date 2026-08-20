export const navItems = [
  { label: "Technology", href: "#architecture" },
  { label: "Manufacturing", href: "#alpha" },
  { label: "Business Model", href: "#model" },
  { label: "About", href: "#people" },
  { label: "Platform", href: "#platform" },
  { label: "Partner With Us", href: "#partner", cta: true }
] as const;

export const philosophy = ["Repeatable", "Measurable", "Traceable", "Scalable", "Intelligent"] as const;

export const leaders = [
  {
    name: "Omkar",
    role: "Founder & Chief Technology Officer",
    discipline: "Technology & IP",
    cred: "IIT Madras · B.Tech + M.Tech · 10+ years in engineering, innovation and management",
    focus: "Technology architecture, digital manufacturing systems, product roadmap and Voltron intellectual property.",
    image: "/team/voltron_technology_ip.png"
  },
  {
    name: "Akshay",
    role: "Chief Operating Officer",
    discipline: "Operations",
    cred: "MBA — Marketing & Operations · 10+ Years",
    focus: "Manufacturing operations, customer delivery and operating discipline.",
    image: "/team/voltron_operations.png"
  },
  {
    name: "Hanumanat",
    role: "Chief Installation & Maintenance Officer",
    discipline: "Plant Engineering",
    cred: "18+ Years in Plant Engineering",
    focus: "Physical infrastructure, installation and lifecycle reliability.",
    image: "/team/voltron_plant_engineering.png"
  }
] as const;
