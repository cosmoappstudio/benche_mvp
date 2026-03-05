import { motion, AnimatePresence } from "motion/react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { COLORS, SYMBOLS, ELEMENTS } from "@/constants";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface SelectionScreenProps {
  onComplete: (selections: { color: string, symbol: string, element: string, letter: string, number: number | null }) => void;
  onCancel: () => void;
  t: any;
}

// Paint Drop Component
const PaintDrop = ({ color, isSelected, onClick, t }: { color: any, isSelected: boolean, onClick: () => void, t: any }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    animate={isSelected ? { scale: 1.2, y: -10 } : { scale: 1, y: 0 }}
    className="relative w-16 h-20 flex items-center justify-center focus:outline-none mx-2 shrink-0"
  >
    <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-lg" style={{ filter: isSelected ? `drop-shadow(0 0 10px ${color.value})` : 'none' }}>
      <path
        d="M50 0 C50 0 0 60 0 85 C0 104.33 22.39 120 50 120 C77.61 120 100 104.33 100 85 C100 60 50 0 50 0 Z"
        fill={color.value}
      />
      {/* Highlight/Reflection */}
      <path
        d="M30 40 Q20 60 25 80"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.4"
        fill="none"
      />
    </svg>
    {isSelected && (
      <motion.div
        className="absolute -bottom-8 text-xs font-bold text-white whitespace-nowrap bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Use translation if available, otherwise fallback to label */}
        {t.colors?.[color.id]?.label || color.label}
      </motion.div>
    )}
  </motion.button>
);

export function SelectionScreen({ onComplete, onCancel, t }: SelectionScreenProps) {
  const [selections, setSelections] = useState({
    color: "",
    symbol: "",
    element: "",
    letter: "",
    number: null as number | null
  });
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const isComplete = selections.color && selections.symbol && selections.element && selections.letter && selections.number;

  const handleSelect = (key: string, value: string | number) => {
    setSelections(prev => ({ ...prev, [key]: value }));
    setActiveSection(key);
  };

  return (
    <div className="min-h-screen w-full bg-[var(--color-background)] pb-32 overflow-x-hidden">
      {/* ... (Background Particles and Header remain same) ... */}

      {/* Header Summary (Combo View) */}
      <div className="sticky top-0 z-40 bg-[var(--color-background)]/80 backdrop-blur-md border-b border-white/5 pt-4 pb-2 px-6 transition-all duration-500">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-white">{t.selection.title}</h2>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[var(--color-text-secondary)] font-mono">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
            </span>
            <button 
              onClick={onCancel}
              className="p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            >
              <Icon name="X" className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Combo Line */}
        <div className="flex items-center justify-between relative h-12">
           {/* Connecting Line */}
           <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/10 -z-10" />
           
           {/* Step 1: Color */}
           <motion.div 
             animate={selections.color ? { scale: 1.1, borderColor: selections.color } : { scale: 1, borderColor: "rgba(255,255,255,0.1)" }}
             className="w-8 h-8 rounded-full bg-[var(--color-background)] border-2 flex items-center justify-center transition-colors"
             style={{ borderColor: selections.color || "rgba(255,255,255,0.1)" }}
           >
             {selections.color && <div className="w-full h-full rounded-full opacity-80" style={{ backgroundColor: selections.color }} />}
           </motion.div>

           {/* Step 2: Symbol */}
           <motion.div 
             animate={selections.symbol ? { scale: 1.1, borderColor: "#fff" } : { scale: 1, borderColor: "rgba(255,255,255,0.1)" }}
             className="w-8 h-8 rounded-full bg-[var(--color-background)] border-2 border-white/10 flex items-center justify-center text-xs"
           >
             {selections.symbol && <Icon name={SYMBOLS.find(s => s.id === selections.symbol)?.icon || ""} className="w-4 h-4 text-white" />}
           </motion.div>

           {/* Step 3: Element */}
           <motion.div 
             animate={selections.element ? { scale: 1.1, borderColor: "#fff" } : { scale: 1, borderColor: "rgba(255,255,255,0.1)" }}
             className="w-8 h-8 rounded-full bg-[var(--color-background)] border-2 border-white/10 flex items-center justify-center text-xs"
           >
             {selections.element && <Icon name={ELEMENTS.find(e => e.id === selections.element)?.icon || ""} className="w-4 h-4 text-white" />}
           </motion.div>

           {/* Step 4: Letter */}
           <motion.div 
             animate={selections.letter ? { scale: 1.1, borderColor: "#fff" } : { scale: 1, borderColor: "rgba(255,255,255,0.1)" }}
             className="w-8 h-8 rounded-full bg-[var(--color-background)] border-2 border-white/10 flex items-center justify-center text-xs font-bold text-white"
           >
             {selections.letter}
           </motion.div>

           {/* Step 5: Number */}
           <motion.div 
             animate={selections.number ? { scale: 1.1, borderColor: "#fff" } : { scale: 1, borderColor: "rgba(255,255,255,0.1)" }}
             className="w-8 h-8 rounded-full bg-[var(--color-background)] border-2 border-white/10 flex items-center justify-center text-xs font-bold text-white"
           >
             {selections.number}
           </motion.div>
        </div>
      </div>

      <div className="p-6 space-y-12">
        
        {/* SECTION 1: COLOR (Paint Drops) */}
        <section>
          <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"/> 
            {t.selection.color}
          </h3>
          
          <div className="flex overflow-x-auto pb-8 -mx-6 px-6 no-scrollbar items-end h-32">
             {COLORS.map((color: any) => (
               <div key={color.value} className="shrink-0">
                 <PaintDrop 
                   color={color} 
                   isSelected={selections.color === color.value}
                   onClick={() => handleSelect('color', color.value)}
                   t={t}
                 />
               </div>
             ))}
          </div>
             
          <AnimatePresence mode="wait">
            {selections.color && (
              <motion.div 
                key="color-meaning"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-2 text-center"
              >
                <p className="text-sm text-white/60 italic">
                  {(() => {
                    const selectedColor = COLORS.find((c: any) => c.value === selections.color);
                    if (!selectedColor) return "";
                    return t.colors?.[selectedColor.id]?.meaning || selectedColor.meaning;
                  })()}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* SECTION 2: SYMBOL (Horizontal Cards) */}
        <section>
          <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-gradient-to-b from-amber-500 to-red-500 rounded-full"/> 
            {t.selection.symbol}
          </h3>
          
          <div className="flex overflow-x-auto snap-x snap-mandatory pb-6 -mx-6 px-6 gap-4 no-scrollbar">
            {SYMBOLS.map((symbol: any) => {
              const isSelected = selections.symbol === symbol.id;
              return (
                <motion.button
                  key={symbol.id}
                  onClick={() => handleSelect('symbol', symbol.id)}
                  className={cn(
                    "snap-center shrink-0 w-40 h-40 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center gap-3 transition-all duration-500 border",
                    isSelected 
                      ? "border-white/40 scale-105 shadow-xl" 
                      : "border-white/5 opacity-60 scale-95"
                  )}
                >
                  {/* Background Gradient */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-20 transition-opacity duration-500",
                    symbol.gradient,
                    isSelected ? "opacity-40" : "opacity-10"
                  )} />
                  
                  {/* Glow Ring */}
                  {isSelected && (
                    <motion.div 
                      layoutId="symbol-glow"
                      className="absolute inset-0 rounded-3xl border-2 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    />
                  )}

                  <Icon name={symbol.icon} className={cn("w-10 h-10 z-10 transition-colors", isSelected ? "text-white" : "text-white/50")} />
                  <span className={cn("text-sm font-medium z-10", isSelected ? "text-white" : "text-white/50")}>
                    {t.symbols?.[symbol.id] || symbol.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: ELEMENT (Horizontal Cards - Same Style as Symbols) */}
        <section>
          <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"/> 
            {t.selection.element}
          </h3>

          <div className="flex overflow-x-auto snap-x snap-mandatory pb-6 -mx-6 px-6 gap-4 no-scrollbar">
            {ELEMENTS.map((element: any) => {
              const isSelected = selections.element === element.id;
              return (
                <motion.button
                  key={element.id}
                  onClick={() => handleSelect('element', element.id)}
                  className={cn(
                    "snap-center shrink-0 w-40 h-40 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center gap-3 transition-all duration-500 border",
                    isSelected 
                      ? "border-white/40 scale-105 shadow-xl" 
                      : "border-white/5 opacity-60 scale-95"
                  )}
                >
                  {/* Background Gradient */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-20 transition-opacity duration-500",
                    element.gradient,
                    isSelected ? "opacity-40" : "opacity-10"
                  )} />
                  
                  {/* Glow Ring */}
                  {isSelected && (
                    <motion.div 
                      layoutId="element-glow"
                      className="absolute inset-0 rounded-3xl border-2 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    />
                  )}

                  <Icon name={element.icon} className={cn("w-10 h-10 z-10 transition-colors", isSelected ? "text-white" : "text-white/50")} />
                  <span className={cn("text-sm font-medium z-10", isSelected ? "text-white" : "text-white/50")}>
                    {t.elements?.[element.id] || element.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* SECTION 4: LETTER (Card Input) */}
        <section>
          <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-8 flex items-center gap-2">
            <span className="w-1 h-4 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full"/> 
            {t.selection.letter}
          </h3>

          <div className="flex justify-center">
            <motion.div 
              className={cn(
                "relative w-40 h-56 rounded-3xl border flex flex-col items-center justify-center overflow-hidden transition-all duration-500",
                selections.letter 
                  ? "border-white/40 bg-white/10 shadow-[0_0_30px_rgba(255,255,255,0.1)]" 
                  : "border-white/10 bg-white/5"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 pointer-events-none" />
              
              <span className="text-xs text-white/40 uppercase tracking-widest mb-4">{t.selection.initial}</span>
              
              <input
                type="text"
                maxLength={1}
                value={selections.letter}
                onChange={(e) => handleSelect('letter', e.target.value.toUpperCase())}
                className="relative z-10 w-full bg-transparent text-center text-8xl font-bold text-white focus:outline-none font-display uppercase caret-white"
                placeholder="?"
              />
              
              {selections.letter && (
                <motion.div 
                  className="absolute bottom-4 w-12 h-1 bg-white/50 rounded-full"
                  layoutId="letter-underline"
                />
              )}
            </motion.div>
          </div>
        </section>

        {/* SECTION 5: NUMBER */}
        <section className="pb-24">
          <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-8 flex items-center gap-2">
            <span className="w-1 h-4 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full"/> 
            {t.selection.number}
          </h3>

          <div className="flex justify-center flex-wrap gap-4 max-w-xs mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <motion.button
                key={num}
                onClick={() => handleSelect('number', num)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-300",
                  selections.number === num
                    ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.5)] scale-110"
                    : "bg-white/10 text-white/50 hover:bg-white/20"
                )}
              >
                {num}
              </motion.button>
            ))}
          </div>
        </section>

      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-6 right-6 z-50">
        <Button
          onClick={() => onComplete(selections as any)}
          disabled={!isComplete}
          fullWidth
          size="lg"
          className={cn(
            "relative overflow-hidden transition-all duration-700 shadow-2xl",
            isComplete 
              ? "opacity-100 translate-y-0 bg-white text-black font-bold" 
              : "opacity-50 translate-y-20 pointer-events-none bg-white/10 text-white/50"
          )}
        >
          {isComplete && (
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
            />
          )}
          <span className="relative z-10 flex items-center justify-center gap-2">
            {t.selection.discover} <Icon name="ArrowRight" className="w-5 h-5" />
          </span>
        </Button>
      </div>
    </div>
  );
}
