import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { Screen } from "@/hooks/useBencheApp";

interface NavigationProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  t: any;
}

export function Navigation({ currentScreen, onNavigate, t }: NavigationProps) {
  const navItems = [
    { id: 'welcome', label: t.navigation.home, icon: 'House' },
    { id: 'likes', label: t.navigation.tasteMap, icon: 'Heart' },
    { id: 'profile', label: t.navigation.profile, icon: 'User' },
  ];

  if (!['welcome', 'results', 'likes', 'profile', 'settings'].includes(currentScreen)) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-white/10 pb-6 pt-2">
      <div className="flex justify-around items-center max-w-md mx-auto w-full">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id || (item.id === 'welcome' && currentScreen === 'results');
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as Screen)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-4 transition-all duration-300 w-full",
                isActive ? "text-white" : "text-white/40 hover:text-white/70"
              )}
            >
              <div className={cn(
                "p-1 rounded-xl transition-all duration-300",
                isActive && "bg-white/10"
              )}>
                <Icon 
                  name={item.icon} 
                  className={cn(
                    "w-6 h-6 transition-all duration-300", 
                    isActive && "text-[var(--color-primary-end)] scale-110"
                  )} 
                />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all duration-300",
                isActive ? "opacity-100" : "opacity-70"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
