import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BrandEntry } from "@/components/entry/BrandEntry";
import { founderSessionCookie } from "@/lib/founder-session-config";
import { verifyFounderTokenEdge } from "@/lib/founder-session-edge";
import { isPrelaunch } from "@/lib/launch";
import "./entry.css";

export const dynamic="force-dynamic";
export const metadata: Metadata={
  title:"Enter the Lattice",
  description:"Human ingenuity. Connected intelligence. Manufacturing possibilities.",
  robots:{index:false,follow:false},
};

export default async function EntryPage(){
  if(isPrelaunch()){
    const token=(await cookies()).get(founderSessionCookie)?.value;
    if(!await verifyFounderTokenEdge(token))redirect("/coming-soon");
  }
  return <BrandEntry/>;
}
