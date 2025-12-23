"use client";
import React, { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const j = await r.json();
      if (!r.ok) {
        setError(j.pesan || "Login gagal");
      } else {
        // cookie sudah diset oleh server
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError("Gagal menghubungi server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Masuk</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input className="mt-1 block w-full" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input className="mt-1 block w-full" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <div>
          <button disabled={loading} className="btn-primary">
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </div>
        <div className="text-sm">
          Belum punya akun? <a href="/register" className="text-blue-600">Daftar</a>
        </div>
      </form>
    </div>
  );
}
