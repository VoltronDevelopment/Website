import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getSessionUser } from "@/lib/admin-auth";

export default async function AdminLoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/admin/projects");

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <p className="admin-eyebrow">Voltron</p>
        <h1>Founder Project Control</h1>
        <p className="admin-lead">Sign in to manage strategic projects, timelines, and milestones.</p>
        <Suspense fallback={<p className="admin-muted">Loading…</p>}>
          <AdminLoginForm />
        </Suspense>
        {process.env.NODE_ENV !== "production" ? (
          <p className="admin-login-hint">
            Dev default: user <code>omkar</code> / password <code>voltron</code>
          </p>
        ) : null}
      </div>
    </div>
  );
}
