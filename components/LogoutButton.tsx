"use client";
import React, { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Logout failed", err);
    } finally {
      setLoading(false);
    }
  }
  return (
    <button onClick={logout} disabled={loading} className="btn-ghost">
      {loading ? "Keluar..." : "Keluar"}
    </button>
  );
}
