"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [secret, setSecret] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem("dashboard_secret") ?? "";
    setSecret(s);
    setSaved(!!s);
  }, []);

  const saveSecret = () => {
    if (secret.trim()) {
      localStorage.setItem("dashboard_secret", secret.trim());
      setSaved(true);
    }
  };

  if (!saved) {
    return (
      <div className="min-h-screen bg-[#0A0A1A] flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md rounded-xl bg-white/5 border border-white/10 p-4 sm:p-6">
          <h1 className="text-xl font-bold text-white mb-2">Benche Admin</h1>
          <p className="text-white/60 text-sm mb-4">
            Devam etmek için dashboard secret girin
          </p>
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
              Giriş
            </button>
          </div>
        </div>
      </div>
    );
  }

  const nav = [
    { href: "/", label: "Overview" },
    { href: "/push", label: "Push" },
    { href: "/auto-push", label: "Otomatik Push" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A1A] flex flex-col md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 border-r border-white/10 p-4 flex-col">
        <h1 className="text-lg font-bold text-white mb-6 px-2">Benche Admin</h1>
        <nav className="space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "bg-purple-600/30 text-white"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      {/* Mobile header */}
      <header className="md:hidden shrink-0 px-4 py-3 border-b border-white/10">
        <h1 className="text-lg font-bold text-white">Benche Admin</h1>
      </header>
      {/* Main content — pb for mobile bottom nav */}
      <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-10 pb-24 md:pb-10">
        {children}
      </main>
      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0A0A1A]/95 backdrop-blur border-t border-white/10 z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around py-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 min-w-[72px] rounded-lg text-xs font-medium transition-colors touch-manipulation ${
                pathname === item.href
                  ? "bg-purple-600/30 text-white"
                  : "text-white/60 hover:text-white active:bg-white/5"
              }`}
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
