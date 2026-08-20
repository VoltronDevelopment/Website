"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/timeline", label: "Timeline" },
  { href: "/admin/attention", label: "Attention" }
];

export function AdminNav() {
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.href = "/admin/login";
  }

  return (
    <header className="admin-header">
      <div className="admin-header-inner">
        <Link href="/admin/projects" className="admin-brand">
          <span className="admin-brand-eyebrow">Voltron</span>
          <strong>Project Control</strong>
        </Link>

        <nav className="admin-nav" aria-label="Admin">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`admin-nav-link${pathname.startsWith(link.href) ? " active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="admin-header-actions">
          <Link href="/" className="admin-link-muted">
            Website
          </Link>
          <button type="button" className="admin-btn-ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
