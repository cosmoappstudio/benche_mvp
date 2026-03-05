/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnimatePresence, motion } from "motion/react";
import { useBencheApp } from "@/hooks/useBencheApp";
import { WelcomeScreen } from "@/components/screens/WelcomeScreen";
import { OnboardingScreen } from "@/components/screens/OnboardingScreen";
import { SelectionScreen } from "@/components/screens/SelectionScreen";
import { LoadingScreen } from "@/components/screens/LoadingScreen";
import { ResultsScreen } from "@/components/screens/ResultsScreen";
import { TasteMapScreen } from "@/components/screens/TasteMapScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";
import { ShareScreen } from "@/components/screens/ShareScreen";
import { SettingsScreen } from "@/components/screens/SettingsScreen";
import { Navigation } from "@/components/ui/Navigation";

export default function App() {
  const {
    screen,
    setScreen,
    language,
    setLanguage,
    setGender,
    selections,
    updateSelection,
    recommendations,
    generateRecommendations,
    handleLike,
    handleDislike,
    history,
    loading,
    t,
    userStats
  } = useBencheApp();

  const handleSelectionComplete = (newSelections: any) => {
    // Update all selections at once
    Object.keys(newSelections).forEach(key => {
      updateSelection(key as any, newSelections[key]);
    });
    // Trigger generation with new selections to avoid stale state
    generateRecommendations(newSelections);
  };

  const handleOnboardingComplete = (data: { language: string; gender: string }) => {
    setLanguage(data.language);
    setGender(data.gender);
    setScreen('results');
  };

  return (
    <div className="relative min-h-screen bg-[var(--color-background)] text-white overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        {screen === 'welcome' && (
          <motion.div key="welcome" exit={{ opacity: 0 }} className="absolute inset-0 z-10">
            <WelcomeScreen 
              onStart={() => setScreen(userStats.totalPlans > 0 ? 'selection' : 'onboarding')} 
              userStats={userStats} 
              t={t} 
            />
          </motion.div>
        )}

        {screen === 'onboarding' && (
          <motion.div 
            key="onboarding"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="absolute inset-0 z-10"
          >
            <OnboardingScreen onComplete={handleOnboardingComplete} />
          </motion.div>
        )}

        {screen === 'selection' && (
          <motion.div 
            key="selection"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="absolute inset-0 z-10 overflow-y-auto"
          >
            <SelectionScreen 
              onComplete={handleSelectionComplete} 
              onCancel={() => setScreen(recommendations.length > 0 ? 'results' : 'welcome')}
              t={t} 
            />
          </motion.div>
        )}

        {screen === 'loading' && (
          <motion.div key="loading" exit={{ opacity: 0 }} className="absolute inset-0 z-20">
            <LoadingScreen t={t} />
          </motion.div>
        )}

        {screen === 'results' && (
          <motion.div 
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 overflow-y-auto"
          >
            <ResultsScreen 
              selections={selections}
              recommendations={recommendations}
              onLike={handleLike}
              onDislike={handleDislike}
              onShare={() => setScreen('share')}
              onCreateNew={() => setScreen('selection')}
              onHome={() => setScreen('welcome')}
              t={t}
            />
          </motion.div>
        )}

        {screen === 'likes' && (
          <motion.div 
            key="likes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 overflow-y-auto"
          >
            <TasteMapScreen 
              history={history}
              onUnlike={handleLike}
              onUndislike={handleDislike}
              t={t}
            />
          </motion.div>
        )}

        {screen === 'profile' && (
          <motion.div 
            key="profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 overflow-y-auto"
          >
            <ProfileScreen 
              history={history} 
              t={t} 
              onSettings={() => setScreen('settings')} 
            />
          </motion.div>
        )}

        {screen === 'settings' && (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="absolute inset-0 z-50 overflow-y-auto bg-[var(--color-background)]"
          >
            <SettingsScreen 
              onBack={() => setScreen('profile')}
              language={language}
              setLanguage={setLanguage}
              t={t}
            />
          </motion.div>
        )}

        {screen === 'share' && (
          <motion.div key="share" className="absolute inset-0 z-50">
            <ShareScreen 
              selections={selections}
              recommendations={recommendations}
              onClose={() => setScreen('results')}
              t={t}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Navigation currentScreen={screen} onNavigate={setScreen} t={t} />
    </div>
  );
}
