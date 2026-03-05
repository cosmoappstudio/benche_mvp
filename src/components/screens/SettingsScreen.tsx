import { GlassCard } from "@/components/ui/GlassCard";
import { Icon } from "@/components/ui/Icon";
import { motion } from "motion/react";

interface SettingsScreenProps {
  onBack: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  t: any;
}

export function SettingsScreen({ onBack, language, setLanguage, t }: SettingsScreenProps) {
  const userId = "USER-" + Math.floor(Math.random() * 1000000); // Mock User ID

  const languages = [
    { code: "en", label: "English" },
    { code: "tr", label: "Türkçe" },
    { code: "de", label: "Deutsch" },
    { code: "es", label: "Español" },
  ];

  return (
    <div className="min-h-screen w-full bg-[var(--color-background)] p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Icon name="ArrowLeft" className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-3xl font-bold text-white">{t.settings.title}</h1>
        </header>

        <div className="space-y-4">
          {/* User Info */}
          <GlassCard className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold text-white">
                U
              </div>
              <div>
                <h3 className="font-bold text-white">Guest User</h3>
                <p className="text-sm text-white/60">{t.settings.userId}: {userId}</p>
              </div>
            </div>
          </GlassCard>

          {/* Language */}
          <GlassCard className="p-4">
            <h3 className="font-bold text-white mb-3">{t.settings.language}</h3>
            <div className="grid grid-cols-2 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    language === lang.code 
                      ? "bg-white text-black" 
                      : "bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Actions */}
          <GlassCard className="divide-y divide-white/10">
            <button className="w-full p-4 flex items-center justify-between text-white hover:bg-white/5 transition-colors text-left">
              <span className="flex items-center gap-3">
                <Icon name="RefreshCw" className="w-5 h-5 text-white/70" />
                {t.settings.restorePurchase}
              </span>
              <Icon name="ChevronRight" className="w-4 h-4 text-white/40" />
            </button>
            
            <div className="w-full p-4 flex items-center justify-between text-white">
              <span className="flex items-center gap-3">
                <Icon name="Bell" className="w-5 h-5 text-white/70" />
                {t.settings.notifications}
              </span>
              <div className="w-10 h-6 bg-green-500 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>

            <button className="w-full p-4 flex items-center justify-between text-white hover:bg-white/5 transition-colors text-left">
              <span className="flex items-center gap-3">
                <Icon name="FileText" className="w-5 h-5 text-white/70" />
                {t.settings.agreements}
              </span>
              <Icon name="ChevronRight" className="w-4 h-4 text-white/40" />
            </button>

             <button className="w-full p-4 flex items-center justify-between text-white hover:bg-white/5 transition-colors text-left">
              <span className="flex items-center gap-3">
                <Icon name="Star" className="w-5 h-5 text-white/70" />
                {t.settings.rateUs}
              </span>
              <Icon name="ChevronRight" className="w-4 h-4 text-white/40" />
            </button>

            <button className="w-full p-4 flex items-center justify-between text-white hover:bg-white/5 transition-colors text-left">
              <span className="flex items-center gap-3">
                <Icon name="MessageCircle" className="w-5 h-5 text-white/70" />
                {t.settings.feedback}
              </span>
              <Icon name="ChevronRight" className="w-4 h-4 text-white/40" />
            </button>
          </GlassCard>

          {/* Delete Account */}
          <GlassCard className="p-1">
             <button className="w-full p-4 flex items-center justify-between text-red-400 hover:bg-red-500/10 transition-colors text-left rounded-xl">
              <span className="flex items-center gap-3 font-medium">
                <Icon name="Trash2" className="w-5 h-5" />
                {t.settings.deleteAccount}
              </span>
            </button>
          </GlassCard>
          
          <div className="text-center text-xs text-white/30 py-4">
            Version 1.0.0 (Build 2024.1)
          </div>
        </div>
      </div>
    </div>
  );
}
