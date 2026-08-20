"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { assets } from "@/lib/assets";
import { navItems } from "@/lib/site-content";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const observedSections = [
  { id: "home", href: "#home" },
  { id: "architecture", href: "#architecture" },
  { id: "alpha", href: "#alpha" },
  { id: "model", href: "#model" },
  { id: "people", href: "#people" },
  { id: "advantage", href: "#advantage" },
  { id: "partner", href: "#partner" }
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 48);

      if (currentScrollY <= 24) {
        setIsHeaderHidden(false);
      } else if (currentScrollY > lastScrollY + 4) {
        setIsHeaderHidden(true);
      } else if (currentScrollY < lastScrollY - 4) {
        setIsHeaderHidden(false);
      }

      lastScrollY = currentScrollY;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.clientY <= 56) setIsHeaderHidden(false);
    };

    const onFocusIn = () => setIsHeaderHidden(false);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("focusin", onFocusIn);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("focusin", onFocusIn);
    };
  }, []);

  useEffect(() => {
    const elements = observedSections
      .map((section) => document.getElementById(section.id))
      .filter((node): node is HTMLElement => Boolean(node));

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActiveSection(visible.target.id);
        }
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: [0.12, 0.35, 0.6] }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className={`site-header ${isScrolled ? "scrolled" : "transparent"} ${isHeaderHidden && !menuOpen ? "header-hidden" : ""}`.trim()}>
      <Link className="brand" href="#home" aria-label="Voltron home" onClick={() => setMenuOpen(false)}>
        <Image src={assets.logo} alt="" width={36} height={36} priority className="brand-logo" />
        <span>Voltron</span>
      </Link>

      <nav className="main-nav" aria-label="Main navigation">
        {navItems.map((item) => {
          const isExternal = item.href.startsWith("/");
          const sectionId = isExternal ? "" : item.href.replace("#", "");
          const isCta = "cta" in item && item.cta;
          const isActive = !isCta && !isExternal && activeSection === sectionId;
          const className = [isCta ? "nav-cta" : "nav-link", isActive ? "active" : ""]
            .filter(Boolean)
            .join(" ");

          return (
            <Link
              key={item.label}
              className={className}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <button
          className="nav-toggle"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
        </button>

        <Dialog.Portal>
          <Dialog.Overlay className="nav-overlay" />
          <Dialog.Content className="nav-sheet">
            <Dialog.Title className="sr-only">Navigation</Dialog.Title>
            {navItems.map((item) => (
              <Dialog.Close asChild key={item.label}>
                <Link
                  href={item.href}
                  className={"cta" in item && item.cta ? "nav-cta" : "nav-link"}
                >
                  {item.label}
                </Link>
              </Dialog.Close>
            ))}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </header>
  );
}
