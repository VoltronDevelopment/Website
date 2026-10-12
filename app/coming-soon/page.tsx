import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/coming-soon/ComingSoonPage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Voltron Lattice — Coming this Diwali",
  description: "Building India's Intelligent Manufacturing Backbone. Launching November 8, 2026.",
  robots: { index: false, follow: false }
};

export default function ComingSoonRoute() {
  return <ComingSoonPage/>;
}
