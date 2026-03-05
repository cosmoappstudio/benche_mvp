import { motion, AnimatePresence } from "motion/react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { CATEGORIES, Recommendation, Selections, SYMBOLS, ELEMENTS } from "@/constants";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface ResultsScreenProps {
  selections: Selections;
  recommendations: Recommendation[];
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
  onShare: () => void;
  onCreateNew: () => void;
  onHome: () => void;
  t: any;
}

export function ResultsScreen({ selections, recommendations, onLike, onDislike, onShare, onCreateNew, onHome, t }: ResultsScreenProps) {
  const feedbackCount = recommendations.filter(r => r.liked || r.disliked).length;
  const showProgress = feedbackCount < 5;
  const hasRecommendations = recommendations.length > 0;

  const handleLikeClick = (id: string) => {
    onLike(id);
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FF4D6D', '#FF8FA3']
    });
  };

  const symbolObj = SYMBOLS.find(s => s.id === selections.symbol);
  const elementObj = ELEMENTS.find(e => e.id === selections.element);
  
  const symbolLabel = t.symbols?.[selections.symbol || ""] || symbolObj?.label || selections.symbol;
  const elementLabel = t.elements?.[selections.element || ""] || elementObj?.label || selections.element;

  if (!hasRecommendations) {
    return (
      <div className="min-h-screen w-full bg-[var(--color-background)] flex flex-col items-center justify-center p-6 pb-32 relative">
        <button 
          onClick={onHome}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
        >
          <Icon name="LogOut" className="w-5 h-5" />
        </button>
        <div className="max-w-md w-full text-center space-y-8">
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary-start)] to-[var(--color-primary-end)] rounded-full opacity-20 blur-xl animate-pulse" />
            <div className="relative bg-white/5 border border-white/10 rounded-full w-full h-full flex items-center justify-center">
              <Icon name="Sparkles" className="w-16 h-16 text-[var(--color-primary-end)]" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-bold gradient-text">
              {t.home?.title}
            </h1>
            <p className="text-lg text-[var(--color-text-secondary)]">
              {t.home?.subtitle}
            </p>
          </div>

          <Button 
            onClick={onCreateNew} 
            size="lg" 
            fullWidth 
            className="text-lg py-6 shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:shadow-[0_0_50px_rgba(124,58,237,0.5)] transition-shadow duration-500"
          >
            <Icon name="Sparkles" className="w-6 h-6 mr-2" />
            {t.home?.button}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[var(--color-background)] pb-40">
      <div className="max-w-5xl mx-auto">
        {/* Header Chips */}
        <div className="pt-6 px-6 flex items-center gap-4">
          <button 
            onClick={onHome}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors shrink-0"
          >
            <Icon name="ArrowLeft" className="w-5 h-5" />
          </button>
          <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
            {selections.color && (
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white flex items-center gap-2 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selections.color }} />
                Color
              </div>
            )}
            {selections.symbol && (
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white flex items-center gap-2 whitespace-nowrap">
                <Icon name={SYMBOLS.find(s => s.id === selections.symbol)?.icon || "Sparkles"} className="w-3 h-3" />
                {symbolLabel}
              </div>
            )}
            {selections.element && (
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white flex items-center gap-2 whitespace-nowrap">
                <Icon name={ELEMENTS.find(e => e.id === selections.element)?.icon || "Zap"} className="w-3 h-3" />
                {elementLabel}
              </div>
            )}
            {selections.letter && (
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white flex items-center gap-2 whitespace-nowrap">
                <Icon name="Type" className="w-3 h-3" />
                {selections.letter}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 mt-6 mb-6">
          <h1 className="text-3xl font-bold gradient-text mb-2">{t.results.title}</h1>
          <p className="text-[var(--color-text-secondary)]">
            {t.results.subtitle}
          </p>
        </div>

        {/* Progress Bar */}
        <AnimatePresence>
          {showProgress && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 mb-6"
            >
              <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/20 rounded-xl p-3 flex items-center gap-3">
                <span className="text-xl">🧠</span>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">
                    {5 - feedbackCount} {t.results.feedbackMore}
                  </p>
                  <p className="text-xs text-white/60">
                    {t.results.feedbackDesc}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recommendations List */}
        <div className="px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec, index) => {
            const categoryStyle = CATEGORIES[rec.category as keyof typeof CATEGORIES] || CATEGORIES.Activity;
            
            return (
              <GlassCard 
                key={rec.id}
                className={cn(
                  "relative transition-all duration-300 h-full",
                  rec.disliked && "opacity-60 grayscale-[0.8]"
                )}
              >
                {/* Category Strip */}
                <div className={cn("absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b", categoryStyle.color)} />
                
                <div className="pl-3 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] uppercase tracking-wider font-medium">
                      <Icon name={categoryStyle.icon} className="w-4 h-4" />
                      {t.categories?.[rec.category.toLowerCase()] || rec.category}
                    </div>
                    
                    <div className="flex gap-3">
                      <button 
                        onClick={() => onDislike(rec.id)}
                        className={cn(
                          "p-1.5 rounded-full transition-colors",
                          rec.disliked ? "bg-[var(--color-dislike)] text-white" : "bg-white/5 text-white/30 hover:bg-white/10"
                        )}
                      >
                        <Icon name="ThumbsDown" className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleLikeClick(rec.id)}
                        className={cn(
                          "p-1.5 rounded-full transition-colors",
                          rec.liked ? "bg-[var(--color-like)] text-white shadow-[0_0_10px_rgba(255,77,109,0.5)]" : "bg-white/5 text-white/30 hover:bg-white/10"
                        )}
                      >
                        <Icon name="Heart" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className={cn(
                    "text-lg font-bold text-white mb-1",
                    rec.disliked && "line-through decoration-white/30"
                  )}>
                    {rec.title}
                  </h3>
                  
                  <p className="text-sm text-[var(--color-text-secondary)] mb-3 flex-1">
                    {rec.description}
                  </p>
                  
                  <p className="text-xs text-white/50 italic border-l-2 border-white/10 pl-2">
                    "{rec.reason}"
                  </p>

                  {/* Link and Platform Info */}
                  {(rec.link || rec.platform) && (
                    <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-2 items-center">
                      {rec.platform && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/10 text-xs text-white/90 font-medium">
                          <Icon name="MonitorPlay" className="w-3 h-3" />
                          {rec.platform}
                        </div>
                      )}
                      {rec.link && (
                        <a
                          href={rec.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-black text-xs font-bold hover:bg-white/90 transition-colors shadow-sm"
                        >
                          <Icon name="ExternalLink" className="w-3 h-3" />
                          {rec.category === 'Food' ? t.results.recipe :
                           rec.category === 'Book' ? t.results.buy :
                           rec.category === 'Playlist' ? t.results.listen :
                           t.results.open}
                        </a>
                      )}
                    </div>
                  )}

                  {rec.disliked && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] rounded-2xl"
                    >
                      <span className="bg-black/80 text-white text-xs px-3 py-1 rounded-full">
                        {t.results.hidden}
                      </span>
                    </motion.div>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="fixed bottom-24 left-0 right-0 z-20 pointer-events-none">
          <div className="max-w-5xl mx-auto px-6 flex flex-col gap-3 pointer-events-auto">
             <Button 
              onClick={onCreateNew} 
              fullWidth 
              className="shadow-lg bg-gradient-to-r from-[var(--color-primary-start)] to-[var(--color-primary-end)] text-white font-bold py-3"
            >
              <Icon name="RefreshCw" className="w-4 h-4 mr-2" />
              {t.results.createNew}
            </Button>
            <div className="flex gap-3">
              <Button onClick={onShare} fullWidth variant="secondary" className="flex-1 shadow-lg bg-[var(--color-background)]/90 backdrop-blur-md border border-white/10">
                <Icon name="Share" className="w-4 h-4 mr-2" />
                {t.results.share}
              </Button>
              <Button onClick={onShare} fullWidth variant="secondary" className="flex-1 shadow-lg bg-[var(--color-background)]/90 backdrop-blur-md border border-white/10">
                <Icon name="MessageCircle" className="w-4 h-4 mr-2" />
                {t.results.whatsapp}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
