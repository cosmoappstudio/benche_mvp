import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LANGUAGES, GENDERS } from "@/constants";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { TRANSLATIONS } from "@/translations";

interface OnboardingScreenProps {
  onComplete: (data: { language: string; gender: string }) => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState("en");
  const [gender, setGender] = useState("");
  const [locationGranted, setLocationGranted] = useState(false);

  // Get translations based on currently selected language (defaulting to English for step 1)
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const handleNext = () => {
    if (step === 1 && language) {
      setStep(2);
    } else if (step === 2 && gender) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      onComplete({ language, gender });
    }
  };

  const requestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationGranted(true);
        setTimeout(() => setStep(4), 1000);
      },
      (error) => {
        console.error("Location error:", error);
        setStep(4);
      }
    );
  };

  return (
    <div className="min-h-screen w-full bg-[var(--color-background)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-[#FF2D55]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] bg-[#AF52DE]/10 rounded-full blur-[100px]" />
      </div>

      <div className="z-10 w-full max-w-md space-y-8">
        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div 
              key={s} 
              className={cn(
                "w-2 h-2 rounded-full transition-colors duration-300",
                step >= s ? "bg-white" : "bg-white/20"
              )} 
            />
          ))}
        </div>

        {/* Step 1: Language */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 text-center"
          >
            <h2 className="text-3xl font-bold text-white">{t.onboarding.languageTitle}</h2>
            <p className="text-white/60">{t.onboarding.languageDesc}</p>
            
            <div className="grid grid-cols-2 gap-4">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={cn(
                    "p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2",
                    language === lang.code 
                      ? "bg-white/10 border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  )}
                >
                  <span className="text-4xl">{lang.flag}</span>
                  <span className={cn("font-medium", language === lang.code ? "text-white" : "text-white/60")}>
                    {lang.name}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Gender */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 text-center"
          >
            <h2 className="text-3xl font-bold text-white">{t.onboarding.genderTitle}</h2>
            <p className="text-white/60">{t.onboarding.genderDesc}</p>
            
            <div className="space-y-3">
              {GENDERS.map((g) => {
                // Map gender ID to translation key
                const labelKey = g.id === 'non-binary' ? 'nonBinary' : g.id === 'prefer-not-to-say' ? 'preferNotToSay' : g.id;
                const label = t.genders[labelKey as keyof typeof t.genders] || g.label;
                
                return (
                  <button
                    key={g.id}
                    onClick={() => setGender(g.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border text-left transition-all duration-300 flex justify-between items-center",
                      gender === g.id 
                        ? "bg-white/10 border-white text-white" 
                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                    )}
                  >
                    <span>{label}</span>
                    {gender === g.id && <Icon name="Check" className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 text-center"
          >
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="MapPin" className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-white">{t.onboarding.locationTitle}</h2>
            <p className="text-white/60">
              {t.onboarding.locationDesc}
            </p>
            
            <Button 
              onClick={requestLocation} 
              fullWidth 
              size="lg"
              className="bg-white text-black hover:bg-white/90"
            >
              {locationGranted ? t.onboarding.locationEnabled : t.onboarding.allowLocation}
            </Button>
            
            <button 
              onClick={() => setStep(4)}
              className="text-sm text-white/40 hover:text-white transition-colors mt-4"
            >
              {t.onboarding.skip}
            </button>
          </motion.div>
        )}

        {/* Step 4: Explanation */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 text-center"
          >
            <h2 className="text-3xl font-bold text-white">{t.onboarding.explanationTitle}</h2>
            <p className="text-white/60 mb-6">{t.onboarding.explanationDesc}</p>
            
            <div className="space-y-4 text-left">
              {[t.onboarding.explanation1, t.onboarding.explanation2, t.onboarding.explanation3].map((text, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-white font-bold">
                    {i + 1}
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed pt-1">{text}</p>
                </motion.div>
              ))}
            </div>

            <Button
              onClick={() => onComplete({ language, gender })}
              fullWidth
              size="lg"
              className="mt-8 bg-white text-black hover:bg-white/90"
            >
              {t.onboarding.startApp}
            </Button>
          </motion.div>
        )}

        {/* Navigation Buttons for Step 1 & 2 */}
        {step < 3 && (
          <div className="pt-8">
            <Button
              onClick={handleNext}
              disabled={step === 1 ? !language : !gender}
              fullWidth
              size="lg"
              className={cn(
                "transition-all duration-300",
                (step === 1 ? !language : !gender) ? "opacity-50" : "opacity-100"
              )}
            >
              {t.onboarding.continue}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
