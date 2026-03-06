"use client";

import { useState, useEffect } from "react";

export default function DashboardPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    sent?: number;
    failed?: number;
    total?: number;
    error?: string;
  } | null>(null);
  const [subscribers, setSubscribers] = useState<number | null>(null);
  const [secret, setSecret] = useState("");

  useEffect(() => {
    const s = localStorage.getItem("dashboard_secret") ?? "";
    setSecret(s);
    if (s) fetchStats(s);
  }, []);

  const fetchStats = async (s: string) => {
    try {
      const res = await fetch("/api/stats", {
        headers: { "x-dashboard-secret": s },
      });
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers ?? 0);
      }
    } catch {
      setSubscribers(null);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim()) {
      setResult({ error: "Önce secret girin ve kaydedin" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/send-push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-dashboard-secret": secret,
        },
        body: JSON.stringify({ title, body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ error: data.error ?? "Gönderim hatası" });
      } else {
        setResult({ sent: data.sent, failed: data.failed, total: data.total });
        fetchStats(secret);
      }
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setLoading(false);
    }
  };

  const saveSecret = () => {
    if (secret.trim()) {
      localStorage.setItem("dashboard_secret", secret.trim());
      fetchStats(secret.trim());
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A1A] text-white p-6 md:p-12">
      <div className="max-w-xl mx-auto space-y-8">
        <header>
          <h1 className="text-2xl font-bold text-white">Benche Push</h1>
          <p className="text-white/60 mt-1">Expo Push Notification Dashboard</p>
        </header>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <label className="block text-sm font-medium text-white/80 mb-2">
            Dashboard Secret
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="DASHBOARD_SECRET"
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={saveSecret}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium"
            >
              Kaydet
            </button>
          </div>
          <p className="text-xs text-white/60 mt-2">
            Vercel env&apos;de DASHBOARD_SECRET ile eşleşmeli
          </p>
        </div>

        {subscribers !== null && (
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-white/60">Push abonesi</p>
            <p className="text-2xl font-bold text-white">{subscribers}</p>
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Başlık
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bugünkü enerjini seç ✨"
              required
              maxLength={100}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-white/60 mt-1">{title.length}/100</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Mesaj
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Güne Benche ile başla — 5 seçim, tüm gün hallolsun."
              required
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            <p className="text-xs text-white/60 mt-1">{body.length}/500</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-center"
          >
            {loading ? "Gönderiliyor..." : "Gönder"}
          </button>
        </form>

        {result && (
          <div
            className={`rounded-xl p-4 ${
              result.error
                ? "bg-red-500/20 border border-red-500/30"
                : "bg-green-500/20 border border-green-500/30"
            }`}
          >
            {result.error ? (
              <p className="text-red-400">{result.error}</p>
            ) : (
              <p className="text-green-400">
                {result.sent} / {result.total} gönderildi
                {result.failed ? ` (${result.failed} hata)` : ""}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
