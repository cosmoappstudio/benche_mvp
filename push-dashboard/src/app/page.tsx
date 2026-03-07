"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { AnalyticsData } from "@/app/api/analytics/route";
import DashboardLayout from "@/components/DashboardLayout";

const CHART_COLORS = ["#8B5CF6", "#A78BFA", "#C4B5FD", "#7C3AED", "#6D28D9"];

export default function OverviewPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = localStorage.getItem("dashboard_secret") ?? "";
    if (!s) return;
    fetch("/api/analytics", { headers: { "x-dashboard-secret": s } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Auth failed"))))
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 text-white/60">
          Yükleniyor...
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="text-red-400">Veri yüklenemedi: {error ?? "Bilinmeyen hata"}</div>
      </DashboardLayout>
    );
  }

  const { overview } = data;

  const kpis = [
    { label: "Toplam Kullanıcı", value: overview.totalUsers },
    { label: "Toplam Plan", value: overview.totalPlans },
    { label: "PRO Kullanıcı", value: `${overview.proUsers} (${overview.proRate}%)` },
    { label: "Push Abonesi", value: overview.pushSubscribers },
    { label: "Bugün Yeni", value: overview.newUsersToday },
    { label: "Bu Hafta Yeni", value: overview.newUsersThisWeek },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <header>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Overview</h1>
          <p className="text-white/60 mt-1 text-sm sm:text-base">Kullanıcı ve engagement metrikleri</p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {kpis.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl bg-white/5 border border-white/10 p-3 sm:p-4"
            >
              <p className="text-xs text-white/60 uppercase tracking-wider truncate">{label}</p>
              <p className="text-lg sm:text-xl font-bold text-white mt-1">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <h2 className="text-sm font-semibold text-white mb-4">Dil Dağılımı</h2>
            <div className="h-48 sm:h-64 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.byLanguage} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="language" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <h2 className="text-sm font-semibold text-white mb-4">Platform (OS)</h2>
            <div className="h-48 sm:h-64 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.byDeviceOs}
                    dataKey="count"
                    nameKey="os"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                  >
                    {data.byDeviceOs.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <h2 className="text-sm font-semibold text-white mb-4">UTM Source (Acquisition)</h2>
            <div className="h-48 sm:h-64 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.byUtmSource} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="source" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                  <Bar dataKey="count" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <h2 className="text-sm font-semibold text-white mb-4">Plan Sayısı Dağılımı</h2>
            <div className="h-48 sm:h-64 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.plansDistribution} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="range" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                  <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4 overflow-hidden">
          <h2 className="text-sm font-semibold text-white mb-4">Top 10 Cihaz Modeli</h2>
          <div className="overflow-x-auto -mx-2 px-2 touch-pan-x">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/60 border-b border-white/10">
                  <th className="text-left py-2 px-3">Model</th>
                  <th className="text-right py-2 px-3">Kullanıcı</th>
                </tr>
              </thead>
              <tbody>
                {data.topDevices.map(({ model, count }) => (
                  <tr key={model} className="border-b border-white/5">
                    <td className="py-2 px-3 text-white">{model}</td>
                    <td className="py-2 px-3 text-right text-white/80">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
