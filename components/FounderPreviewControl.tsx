"use client";

import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { launchAt } from "@/lib/launch";

export function FounderPreviewControl() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (Date.now() >= launchAt) return;
    fetch("/api/founder/session", { cache: "no-store" })
      .then(response => response.json())
      .then(result => setActive(result.authenticated === true))
      .catch(() => setActive(false));
  }, []);

  if (!active) return null;

  async function signOut() {
    await fetch("/api/founder/logout", { method: "POST" });
    window.location.assign("/");
  }

  return <button className="founder-preview-control" type="button" onClick={signOut}><LogOut size={15} aria-hidden="true"/>Exit founder review</button>;
}
