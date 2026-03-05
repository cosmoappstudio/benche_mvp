import { motion } from "motion/react";
import { useState, useEffect } from "react";

interface LoadingScreenProps {
  t: any;
}

export function LoadingScreen({ t }: LoadingScreenProps) {
  const [loadingText, setLoadingText] = useState(t.loading.step1);

  useEffect(() => {
    const steps = [t.loading.step1, t.loading.step2, t.loading.step3];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % steps.length;
      setLoadingText(steps[i]);
    }, 2000);
    return () => clearInterval(interval);
  }, [t]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[var(--color-background)] relative overflow-hidden">
      {/* Equalizer Effect */}
      <div className="flex items-end gap-2 h-32 mb-12">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              height: ["20%", "80%", "40%", "100%", "30%"],
              backgroundColor: ["#FF2D55", "#AF52DE", "#32ADE6", "#FFCC00", "#FF2D55"]
            }}
            transition={{ 
              duration: 0.8, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: i * 0.1,
              repeatType: "mirror"
            }}
            className="w-4 rounded-full"
          />
        ))}
      </div>

      <h2 className="text-2xl font-bold text-white mb-2 min-h-[2rem] text-center px-4 font-display tracking-tight">
        {loadingText}
      </h2>
      <p className="text-[var(--color-text-secondary)] text-center max-w-xs text-sm">
        {t.onboarding.explanationDesc}
      </p>
    </div>
  );
}
