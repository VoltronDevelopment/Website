export const assets = {
  logo: "/voltron-logo.webp",
  ogImage: "/og-image.webp",
  companyProfile: "/voltron-company-profile.pdf",
  factory: {
    physical: "/voltron_factory.webp",
    digitalTwin: "/voltron_digital_factory.webp"
  },
  voltron: {
    screen: "/voltron_screen.webp",
    customerPortal: "/voltron_customer.webp"
  },
  alpha: {
    flow: "/voltron_alpha.webp"
  },
  team: {
    omkar: "/team/omkar.webp"
  },
  social: {
    linkedin: "https://www.linkedin.com/company/voltron-coating-solutions",
    instagram: "https://www.instagram.com/voltron.coatings"
  }
} as const;

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://voltroncoat.com";
