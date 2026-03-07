"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface AutoPushConfig {
  id: string;
  trigger_type: string;
  name: string;
  title: string;
  body: string;
  enabled: boolean;
  rules: Record<string, unknown>;
}

const TRIGGER_LABELS: Record<string, string> = {
  daily_morning: "Günlük sabah",
  weekend: "Hafta sonu",
  install_1h: "İndirme 1 saat",
  onboarding_24h: "Onboarding 24 saat",
  pro_teachvik: "PRO teşviki",
};

export default function AutoPushPage() {
  const [configs, setConfigs] = useState<AutoPushConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<AutoPushConfig>>({});

  const getSecret = () => localStorage.getItem("dashboard_secret") ?? "";

  const fetchConfigs = async () => {
    const s = getSecret();
    if (!s) return;
    try {
      const res = await fetch("/api/auto-push", {
        headers: { "x-dashboard-secret": s },
      });
      if (res.ok) {
        const data = await res.json();
        setConfigs(data);
      }
    } catch {
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleEdit = (c: AutoPushConfig) => {
    setEditing(c.id);
    setEditForm({ title: c.title, body: c.body, enabled: c.enabled, rules: c.rules });
  };

  const handleSave = async () => {
    if (!editing) return;
    const s = getSecret();
    if (!s) return;
    try {
      const res = await fetch("/api/auto-push", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-dashboard-secret": s,
        },
        body: JSON.stringify({
          id: editing,
          title: editForm.title,
          body: editForm.body,
          enabled: editForm.enabled,
          rules: editForm.rules,
        }),
      });
      if (res.ok) {
        setEditing(null);
        fetchConfigs();
      }
    } catch {
      // ignore
    }
  };

  const renderRulesEditor = (triggerType: string, rules: Record<string, unknown>) => {
    const r = rules ?? {};
    const update = (key: string, val: number) =>
      setEditForm((f) => ({ ...f, rules: { ...(f.rules ?? {}), [key]: val } }));

        switch (triggerType) {
      case "daily_morning":
      case "weekend":
        return (
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 text-sm">
            <div>
              <label className="text-white/60">Saat</label>
              <input
                type="number"
                min={0}
                max={23}
                value={(r.hour as number) ?? 8}
                onChange={(e) => update("hour", parseInt(e.target.value, 10) || 0)}
                className="mt-1 w-full px-2 py-1 rounded bg-white/5 border border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-white/60">Dakika</label>
              <input
                type="number"
                min={0}
                max={59}
                value={(r.minute as number) ?? 0}
                onChange={(e) => update("minute", parseInt(e.target.value, 10) || 0)}
                className="mt-1 w-full px-2 py-1 rounded bg-white/5 border border-white/10 text-white"
              />
            </div>
          </div>
        );
      case "install_1h":
        return (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <label className="text-white/60">Min saat</label>
              <input
                type="number"
                min={0}
                value={(r.min_hours as number) ?? 1}
                onChange={(e) => update("min_hours", parseInt(e.target.value, 10) || 0)}
                className="mt-1 w-full px-2 py-1 rounded bg-white/5 border border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-white/60">Max saat</label>
              <input
                type="number"
                min={0}
                value={(r.max_hours as number) ?? 2}
                onChange={(e) => update("max_hours", parseInt(e.target.value, 10) || 0)}
                className="mt-1 w-full px-2 py-1 rounded bg-white/5 border border-white/10 text-white"
              />
            </div>
          </div>
        );
      case "onboarding_24h":
        return (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <label className="text-white/60">Min saat</label>
              <input
                type="number"
                min={0}
                value={(r.min_hours as number) ?? 24}
                onChange={(e) => update("min_hours", parseInt(e.target.value, 10) || 0)}
                className="mt-1 w-full px-2 py-1 rounded bg-white/5 border border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-white/60">Max saat</label>
              <input
                type="number"
                min={0}
                value={(r.max_hours as number) ?? 25}
                onChange={(e) => update("max_hours", parseInt(e.target.value, 10) || 0)}
                className="mt-1 w-full px-2 py-1 rounded bg-white/5 border border-white/10 text-white"
              />
            </div>
          </div>
        );
      case "pro_teachvik":
        return (
          <div className="text-sm">
            <label className="text-white/60">Min plan sayısı</label>
            <input
              type="number"
              min={0}
              value={(r.min_plans as number) ?? 5}
              onChange={(e) =>
                setEditForm((f) => ({
                  ...f,
                  rules: { ...(f.rules ?? {}), min_plans: parseInt(e.target.value, 10) || 0 },
                }))
              }
              className="mt-1 w-full px-2 py-1 rounded bg-white/5 border border-white/10 text-white"
            />
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 text-white/60">Yükleniyor...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <header>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Otomatik Push</h1>
          <p className="text-white/60 mt-1 text-sm sm:text-base">
            Tetikleyicileri düzenle — metin ve kurallar dashboard&apos;dan değiştirilebilir
          </p>
        </header>

        <div className="rounded-xl bg-white/5 border border-white/10 p-3 sm:p-4 text-sm text-white/60 overflow-x-auto">
          <p>
            Cron: <code className="bg-white/10 px-1 rounded">GET /api/cron/auto-push</code> her 15
            dakikada çağrılmalı. Vercel Cron veya harici servis ile ayarlayın.
          </p>
        </div>

        <div className="space-y-4">
          {configs.map((c) => (
            <div
              key={c.id}
              className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-white">
                    {TRIGGER_LABELS[c.trigger_type] ?? c.name}
                  </h2>
                  <p className="text-xs text-white/60">{c.trigger_type}</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-white/80">Aktif</span>
                  <input
                    type="checkbox"
                    checked={editing === c.id ? (editForm.enabled ?? c.enabled) : c.enabled}
                    onChange={async (e) => {
                      if (editing === c.id) {
                        setEditForm((f) => ({ ...f, enabled: e.target.checked }));
                      } else {
                        const s = getSecret();
                        if (!s) return;
                        try {
                          await fetch("/api/auto-push", {
                            method: "PATCH",
                            headers: {
                              "Content-Type": "application/json",
                              "x-dashboard-secret": s,
                            },
                            body: JSON.stringify({ id: c.id, enabled: e.target.checked }),
                          });
                          fetchConfigs();
                        } catch {
                          // ignore
                        }
                      }
                    }}
                    className="rounded"
                  />
                </label>
              </div>

              {editing === c.id ? (
                <div className="space-y-3 pt-2 border-t border-white/10">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Başlık</label>
                    <input
                      type="text"
                      value={editForm.title ?? ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                      maxLength={100}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Mesaj</label>
                    <textarea
                      value={editForm.body ?? ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, body: e.target.value }))}
                      maxLength={500}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Kurallar</label>
                    {renderRulesEditor(c.trigger_type, editForm.rules ?? c.rules ?? {})}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="flex-1 min-h-[44px] px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium touch-manipulation"
                    >
                      Kaydet
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="flex-1 min-h-[44px] px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm touch-manipulation"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-sm">
                  <p className="text-white/80">
                    <strong>Başlık:</strong> {c.title}
                  </p>
                  <p className="text-white/60 mt-1">{c.body}</p>
                  <button
                    onClick={() => handleEdit(c)}
                    className="mt-2 text-purple-400 hover:text-purple-300 text-sm"
                  >
                    Düzenle
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
