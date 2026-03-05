import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Icon } from "@/components/ui/Icon";
import { CATEGORIES, Recommendation } from "@/constants";
import { cn } from "@/lib/utils";

interface TasteMapScreenProps {
  history: Recommendation[];
  onUnlike: (id: string) => void; // For removing from likes
  onUndislike: (id: string) => void; // For removing from dislikes
  t: any;
}

export function TasteMapScreen({ history, onUnlike, onUndislike, t }: TasteMapScreenProps) {
  const [activeTab, setActiveTab] = useState<'likes' | 'dislikes'>('likes');
  const [filter, setFilter] = useState<string>('All');

  const likes = history.filter(h => h.liked);
  const dislikes = history.filter(h => h.disliked);

  const displayedItems = activeTab === 'likes' ? likes : dislikes;
  const filteredItems = filter === 'All' 
    ? displayedItems 
    : displayedItems.filter(item => item.category === filter);

  const categories = ['All', ...Object.keys(CATEGORIES)];

  return (
    <div className="min-h-screen w-full bg-[var(--color-background)] p-6 pb-32">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-1">{t.tasteMap.title}</h1>
          <p className="text-[var(--color-text-secondary)] text-sm">
            {t.tasteMap.subtitle}
          </p>
        </header>

        {/* Tabs */}
        <div className="flex p-1 bg-white/5 rounded-xl mb-6 max-w-md mx-auto md:mx-0">
          <button
            onClick={() => setActiveTab('likes')}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === 'likes' ? "bg-white/10 text-white shadow-sm" : "text-white/40"
            )}
          >
            ❤️ {t.tasteMap.liked}
          </button>
          <button
            onClick={() => setActiveTab('dislikes')}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === 'dislikes' ? "bg-white/10 text-white shadow-sm" : "text-white/40"
            )}
          >
            👎 {t.tasteMap.disliked}
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all",
                filter === cat 
                  ? "bg-white text-black border-white" 
                  : "bg-transparent text-white/60 border-white/10 hover:border-white/30"
              )}
            >
              {cat === 'All' ? (t.categories?.all || 'All') : t.categories?.[cat.toLowerCase()] || cat}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={cn(
          "space-y-4",
          filteredItems.length > 0 && "md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4"
        )}>
          <AnimatePresence mode="popLayout">
            {filteredItems.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center col-span-full"
              >
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-3xl">
                  {activeTab === 'likes' ? '❤️' : '🧠'}
                </div>
                <p className="text-white font-medium">
                  {activeTab === 'likes' ? t.tasteMap.noLikes : t.tasteMap.noDislikes}
                </p>
                <p className="text-white/40 text-sm mt-1">
                  {activeTab === 'likes' ? t.tasteMap.noLikesDesc : t.tasteMap.noDislikesDesc}
                </p>
              </motion.div>
            ) : (
              filteredItems.map((item) => (
                <GlassCard 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={cn(
                    "flex items-center justify-between gap-4 h-full",
                    activeTab === 'dislikes' && "grayscale opacity-70"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{CATEGORIES[item.category as keyof typeof CATEGORIES]?.icon === 'Film' ? '🎬' : '🎵'}</span>
                      <h3 className="font-bold text-white truncate">{item.title}</h3>
                    </div>
                    <p className="text-xs text-white/50 truncate">{item.category} • {new Date().toLocaleDateString()}</p>
                    {activeTab === 'dislikes' && (
                      <p className="text-[10px] text-[var(--color-dislike)] mt-1">{t.tasteMap.categoryRemoved}</p>
                    )}
                  </div>

                  <button
                    onClick={() => activeTab === 'likes' ? onUnlike(item.id) : onUndislike(item.id)}
                    className={cn(
                      "p-2 rounded-full transition-colors",
                      activeTab === 'likes' 
                        ? "text-[var(--color-like)] hover:bg-[var(--color-like)]/10" 
                        : "text-white/40 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <Icon name={activeTab === 'likes' ? "Heart" : "RefreshCw"} className={cn("w-5 h-5", activeTab === 'likes' && "fill-current")} />
                  </button>
                </GlassCard>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
