import { GlassCard } from "@/components/ui/GlassCard";
import { Icon } from "@/components/ui/Icon";
import { Recommendation } from "@/constants";

interface ProfileScreenProps {
  history: Recommendation[];
  t: any;
  onSettings: () => void;
}

export function ProfileScreen({ history, t, onSettings }: ProfileScreenProps) {
  const likesCount = history.filter(h => h.liked).length;
  const dislikesCount = history.filter(h => h.disliked).length;

  // Calculate most liked category
  const categoryCounts = history
    .filter(h => h.liked)
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
  const mostLikedCategory = Object.entries(categoryCounts).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || "-";

  return (
    <div className="min-h-screen w-full bg-[var(--color-background)] p-6 pb-32">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">{t.profile.historyCards}</h1>
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 bg-gradient-to-r from-amber-400 to-yellow-600 text-black text-xs font-bold rounded uppercase tracking-wider">
              {t.profile.pro}
            </span>
            <button 
              onClick={onSettings}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Icon name="Settings" className="w-5 h-5 text-white" />
            </button>
          </div>
        </header>

        {/* Stats Strip */}
        <GlassCard className="mb-8 flex justify-between items-center py-4 px-2">
          <div className="flex flex-col items-center flex-1 border-r border-white/10 px-1">
            <span className="text-xl font-bold text-white flex items-center gap-1">
              <span className="text-[var(--color-like)]">❤️</span> {likesCount}
            </span>
          </div>
          <div className="flex flex-col items-center flex-1 border-r border-white/10 px-1">
            <span className="text-xl font-bold text-white flex items-center gap-1">
              <span className="text-[var(--color-dislike)]">👎</span> {dislikesCount}
            </span>
          </div>
          <div className="flex flex-col items-center flex-1 px-1">
            <span className="text-sm font-bold text-white truncate max-w-[80px]">
              {mostLikedCategory}
            </span>
          </div>
        </GlassCard>

        <h2 className="text-lg font-bold text-white mb-4">{t.profile.pastCards}</h2>
        
        {/* History Grid (Mocked for visual as we only have current session) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Current Session Card */}
          <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-white/10 p-4 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex justify-between items-start">
              <span className="text-xs text-white/60 font-mono">{t.profile.today}</span>
              <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.5)]" />
            </div>

            <div className="text-center">
              <div className="text-2xl mb-1">🔮</div>
              <div className="text-sm font-bold text-white">Deep Calm</div>
            </div>

            <div className="flex justify-between text-xs text-white/40">
              <span className="flex items-center gap-1">❤️ {likesCount}</span>
              <span className="flex items-center gap-1">👎 {dislikesCount}</span>
            </div>
          </div>

          {/* Mock Past Cards */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-white/5 border border-white/5 p-4 flex flex-col justify-between opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
              <div className="flex justify-between items-start">
                <span className="text-xs text-white/40 font-mono">MAR {10-i}</span>
              </div>

              <div className="text-center">
                <div className="text-2xl mb-1">{['🔥', '🌊', '🌱'][i-1]}</div>
                <div className="text-sm font-bold text-white/70">
                  {['Wild Fire', 'Ocean Flow', 'Earth Root'][i-1]}
                </div>
              </div>

              <div className="flex justify-between text-xs text-white/30">
                <span className="flex items-center gap-1">❤️ {Math.floor(Math.random() * 10)}</span>
                <span className="flex items-center gap-1">👎 {Math.floor(Math.random() * 5)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
