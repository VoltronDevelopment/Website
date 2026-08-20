"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("omkar");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Login failed.");
        return;
      }
      const rawNext = searchParams.get("next") || "/admin/projects";
      const next =
        rawNext === "/admin" || !rawNext.startsWith("/admin") ? "/admin/projects" : rawNext;
      router.push(next);
      router.refresh();
    } catch {
      setError("Unable to sign in. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="admin-login-form" method="post" action="/api/admin/login" onSubmit={onSubmit}>
      <label>
        Username
        <input
          name="username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      {error ? <p className="admin-form-error">{error}</p> : null}
      <button type="submit" className="admin-btn-primary" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
