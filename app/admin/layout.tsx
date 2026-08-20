import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { getSessionUser } from "@/lib/admin-auth";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin | Voltron Project Control",
  robots: { index: false, follow: false }
};

export default async function AdminLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getSessionUser();

  return (
    <div className="admin-shell">
      {user ? <AdminNav /> : null}
      <main className="admin-main">{children}</main>
    </div>
  );
}
