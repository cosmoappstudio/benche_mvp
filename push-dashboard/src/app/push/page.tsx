"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface Segment {
  id: string;
  name: string;
  description: string | null;
}

export default function PushPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [segmentId, setSegmentId] = useState<string>("");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [segmentCount, setSegmentCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    sent?: number;
    failed?: number;
    total?: number;
    error?: string;
  } | null>(null);
  const [subscribers, setSubscribers] = useState<number | null>(null);

  const getSecret = () => localStorage.getItem("dashboard_secret") ?? "";

  const fetchStats = async () => {
    const s = getSecret();
    if (!s) return;
    try {
      const [statsRes, segRes] = await Promise.all([
        fetch("/api/stats", { headers: { "x-dashboard-secret": s } }),
        fetch("/api/segments", { headers: { "x-dashboard-secret": s } }),
      ]);
      if (statsRes.ok) {
        const data = await statsRes.json();
        setSubscribers(data.subscribers ?? 0);
      }
      if (segRes.ok) {
        const data = await segRes.json();
        setSegments(data);
        if (data.length > 0 && !segmentId) setSegmentId(data[0].id);
      }
    } catch {
      setSubscribers(null);
      setSegments([]);
    }
  };

  const fetchSegmentCount = async () => {
    if (!segmentId) return;
    const s = getSecret();
    if (!s) return;
    try {
      const res = await fetch(`/api/segments/${segmentId}/count`, {
        headers: { "x-dashboard-secret": s },
      });
      if (res.ok) {
        const data = await res.json();
        setSegmentCount(data.count ?? 0);
      } else {
        setSegmentCount(null);
      }
    } catch {
      setSegmentCount(null);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchSegmentCount();
  }, [segmentId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const secret = getSecret();
    if (!secret.trim()) {
      setResult({ error: "Önce secret girin" });
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
        body: JSON.stringify({
          title,
          body,
          segmentId: segmentId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ error: data.error ?? "Gönderim hatası" });
      } else {
        setResult({ sent: data.sent, failed: data.failed, total: data.total });
        fetchStats();
        fetchSegmentCount();
      }
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-white">Push Notifications</h1>
          <p className="text-white/60 mt-1">Segment seçerek veya tümüne bildirim gönder</p>
        </header>

        <div className="flex gap-4">
          {subscribers !== null && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex-1">
              <p className="text-white/60 text-sm">Toplam push abonesi</p>
              <p className="text-2xl font-bold text-white">{subscribers}</p>
            </div>
          )}
          {segmentCount !== null && segmentId && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex-1">
              <p className="text-white/60 text-sm">Seçili segment</p>
              <p className="text-2xl font-bold text-white">{segmentCount}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Segment</label>
            <select
              value={segmentId}
              onChange={(e) => setSegmentId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {segments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.description ? `— ${s.description}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Başlık</label>
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
            <label className="block text-sm font-medium text-white/80 mb-2">Mesaj</label>
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
    </DashboardLayout>
  );
}
