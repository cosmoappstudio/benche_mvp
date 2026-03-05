import { motion } from "motion/react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { CATEGORIES, Recommendation, Selections } from "@/constants";
import { cn } from "@/lib/utils";

interface ShareScreenProps {
  selections: Selections;
  recommendations: Recommendation[];
  onClose: () => void;
  t: any;
}

export function ShareScreen({ selections, recommendations, onClose, t }: ShareScreenProps) {
  // Filter out disliked items for the share card
  const shareableRecs = recommendations.filter(r => !r.disliked);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-sm aspect-[9/16] bg-gradient-to-br from-[var(--color-background)] to-[#1a0a2e] rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/50 rounded-full text-white/70 hover:text-white"
        >
          <Icon name="X" className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex-1 p-8 flex flex-col relative">
          {/* Background Glow based on color selection */}
          <div 
            className="absolute top-0 left-0 right-0 h-1/2 opacity-30 blur-[80px]"
            style={{ backgroundColor: selections.color || '#7B2FFF' }}
          />

          {/* Header */}
          <div className="text-center mb-8 relative z-10">
            <h1 className="text-4xl font-bold text-white tracking-tight neon-glow font-display">Benche</h1>
            <p className="text-xs text-white/60 uppercase tracking-widest mt-1">{t.results.dailyEnergyGuide}</p>
          </div>

          {/* Selections Strip */}
          <div className="flex justify-center gap-3 mb-8 relative z-10">
            {selections.color && (
              <div className="w-8 h-8 rounded-full border-2 border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.3)]" style={{ backgroundColor: selections.color }} />
            )}
            {selections.symbol && (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-lg border border-white/10">
                🔮
              </div>
            )}
            {selections.element && (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-lg border border-white/10">
                🌿
              </div>
            )}
            {selections.letter && (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-white border border-white/10">
                {selections.letter}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8" />

          {/* Recommendations List */}
          <div className="space-y-3 relative z-10 flex-1 overflow-hidden">
            {shareableRecs.map((rec) => (
              <div key={rec.id} className="flex items-center gap-3">
                <div className={cn(
                  "w-1 h-8 rounded-full bg-gradient-to-b",
                  CATEGORIES[rec.category as keyof typeof CATEGORIES]?.color || "from-gray-500 to-gray-700"
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/50 uppercase">{t.categories?.[rec.category.toLowerCase()] || rec.category}</span>
                    {rec.liked && <Icon name="Heart" className="w-3 h-3 text-[var(--color-like)] fill-current" />}
                  </div>
                  <p className="text-white font-medium truncate text-sm">{rec.title}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-auto pt-8 text-center relative z-10">
            <p className="text-white/30 text-xs font-mono">benche.app</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
