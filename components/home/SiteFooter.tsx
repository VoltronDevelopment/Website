import { assets } from "@/lib/assets";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <span className="footer-company">Voltron Technologies Pvt Ltd</span>
        <span className="footer-location">Pune, Maharashtra</span>
      </div>

      <div className="footer-social">
        <a
          href={assets.social.linkedin}
          className="footer-social-link"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Voltron on LinkedIn"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.26 2.37 4.26 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
          </svg>
        </a>
        <a
          href={assets.social.instagram}
          className="footer-social-link"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Voltron on Instagram"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
          </svg>
        </a>
      </div>

      <span className="footer-year">&copy; {year}</span>
    </footer>
  );
}
