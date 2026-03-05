import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { COLORS, SYMBOLS, ELEMENTS } from "@/constants";
import { Icon } from "@/components/ui/Icon";

interface WelcomeScreenProps {
  onStart: () => void;
  userStats: {
    totalPlans: number;
    topColor: string | null;
    topSymbol: string | null;
    topElement: string | null;
  };
  t: any;
}

export function WelcomeScreen({ onStart, userStats, t }: WelcomeScreenProps) {
  const topColor = COLORS.find(c => c.value === userStats.topColor);
  const topSymbol = SYMBOLS.find(s => s.id === userStats.topSymbol);
  const topElement = ELEMENTS.find(e => e.id === userStats.topElement);

  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[var(--color-background)] pb-24">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,#FF2D55_10deg,transparent_20deg,#AF52DE_40deg,transparent_50deg)] opacity-20 blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="z-10 flex flex-col items-center text-center px-6 w-full max-w-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="mb-6 relative"
        >
          <div className="absolute inset-0 bg-white/20 blur-xl rounded-full" />
          <h1 className="text-7xl font-display font-black text-white italic tracking-tighter relative z-10 mix-blend-overlay">
            BENCHE
          </h1>
          <h1 className="text-7xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D55] to-[#AF52DE] italic tracking-tighter absolute inset-0 z-20">
            BENCHE
          </h1>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-white/80 mb-8 max-w-xs font-medium"
        >
          {t.welcome.subtitle}
        </motion.p>

        {/* User Stats (if available) */}
        {userStats.totalPlans > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ delay: 0.4 }}
            className="w-full mb-8 bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-md"
          >
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/5">
              <span className="text-sm text-white/60">{t.stats.plansCreated}</span>
              <span className="text-2xl font-bold text-white">{userStats.totalPlans}</span>
            </div>
            
            <div className="flex justify-between gap-2">
              {topColor && (
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-8 h-8 rounded-full border-2 border-white/20" style={{ backgroundColor: topColor.value }} />
                  <span className="text-[10px] text-white/50 uppercase">{t.colors[topColor.id]?.label}</span>
                </div>
              )}
              {topSymbol && (
                <div className="flex flex-col items-center gap-1 flex-1">
                   <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <Icon name={topSymbol.icon} className="w-4 h-4 text-white" />
                   </div>
                   <span className="text-[10px] text-white/50 uppercase">{t.symbols[topSymbol.id]}</span>
                </div>
              )}
              {topElement && (
                <div className="flex flex-col items-center gap-1 flex-1">
                   <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <Icon name={topElement.icon} className="w-4 h-4 text-white" />
                   </div>
                   <span className="text-[10px] text-white/50 uppercase">{t.elements[topElement.id]}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="w-full max-w-xs"
        >
          <Button 
            onClick={onStart} 
            fullWidth 
            size="lg"
            className="bg-white text-black font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]"
          >
            {t.welcome.start}
          </Button>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-8 flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10"
        >
          <div className="flex -space-x-2">
            {[
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces",
              "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=faces", 
              "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop&crop=faces"
            ].map((src, i) => (
              <img 
                key={i} 
                src={src} 
                alt="User" 
                className="w-6 h-6 rounded-full border-2 border-black object-cover"
                referrerPolicy="no-referrer"
              />
            ))}
          </div>
          <p className="text-xs text-white/60">
            <span className="font-bold text-white">12,450+</span> people planned today
          </p>
        </motion.div>
      </div>
    </div>
  );
}
