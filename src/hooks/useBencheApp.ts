import { useState, useEffect, useMemo } from "react";
import { GoogleGenAI } from "@google/genai";
import { Selections, Recommendation } from "@/constants";
import { TRANSLATIONS } from "@/translations";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export type Screen = 'welcome' | 'onboarding' | 'selection' | 'loading' | 'results' | 'likes' | 'profile' | 'share' | 'settings';

export function useBencheApp() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [language, setLanguage] = useState("en");
  const [gender, setGender] = useState("");
  const [selections, setSelections] = useState<Selections>({
    color: null,
    symbol: null,
    element: null,
    letter: null,
    number: null,
  });
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [history, setHistory] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Persist past selections for stats
  const [pastSelections, setPastSelections] = useState<Selections[]>(() => {
    try {
      const saved = localStorage.getItem('benche_past_selections');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('benche_past_selections', JSON.stringify(pastSelections));
  }, [pastSelections]);

  // Calculate User Stats
  const userStats = useMemo(() => {
    const totalPlans = pastSelections.length;
    if (totalPlans === 0) return { totalPlans, topColor: null, topSymbol: null, topElement: null };

    const getTop = (key: keyof Selections) => {
      const counts: Record<string, number> = {};
      pastSelections.forEach(s => {
        const val = s[key];
        if (val) counts[String(val)] = (counts[String(val)] || 0) + 1;
      });
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    };

    return {
      totalPlans,
      topColor: getTop('color'),
      topSymbol: getTop('symbol'),
      topElement: getTop('element')
    };
  }, [pastSelections]);

  // Translation helper
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const updateSelection = (key: keyof Selections, value: string | number) => {
    setSelections(prev => ({ ...prev, [key]: value }));
  };

  const generateRecommendations = async (selectionsOverride?: Selections) => {
    const currentSelections = selectionsOverride || selections;
    
    setScreen('loading');
    setLoading(true);

    // Save to past selections
    setPastSelections(prev => [...prev, currentSelections]);

    try {
      // Get user location
      let locationText = "Unknown Location";
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        locationText = `${position.coords.latitude}, ${position.coords.longitude}`;
      } catch (e) {
        console.log("Location access denied or failed");
      }

      const prompt = `
        Act as a cool, modern, and energetic daily lifestyle guide named Benche.
        The user is at location: ${locationText}.
        The user's language is: ${language}.
        The user's gender is: ${gender}.
        The user has chosen the following vibe for today:
        - Color: ${currentSelections.color}
        - Symbol: ${currentSelections.symbol}
        - Element: ${currentSelections.element}
        - Letter: ${currentSelections.letter}
        - Lucky Number: ${currentSelections.number}

        Based on these choices, generate 6 personalized recommendations for today.
        Categories: Food, Playlist, Movie, Series, Book, Activity.
        
        Return the response as a JSON array of objects with keys:
        - category (one of the above)
        - title (specific recommendation name)
        - description (short description)
        - reason (why it fits today's vibe, energetic and fun)
        - link (URL for Playlist [Spotify/YouTube], Food [Recipe], Book [Amazon])
        - platform (String listing platforms for Movie/Series e.g. "Netflix, Amazon Prime")
        
        Make the tone "hype, modern, and engaging", like a cool friend or a lifestyle influencer.
        Avoid mystical or cosmic language. Focus on mood, energy, and style.
        Ensure the output is in the user's selected language (${language}).
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const data = JSON.parse(response.text || "[]");
      const recsWithIds = data.map((item: any, index: number) => ({
        ...item,
        id: `rec-${Date.now()}-${index}`,
        liked: false,
        disliked: false
      }));

      setRecommendations(recsWithIds);
      setTimeout(() => {
        setScreen('results');
        setLoading(false);
      }, 2000); // Minimum loading time for effect

    } catch (error) {
      console.error("Failed to generate recommendations", error);
      // Fallback or error handling
      setLoading(false);
      setScreen('selection'); // Go back on error
    }
  };

  const handleLike = (id: string) => {
    setRecommendations(prev => prev.map(rec => {
      if (rec.id === id) {
        const newRec = { ...rec, liked: !rec.liked, disliked: false };
        // Update history
        if (newRec.liked) {
            setHistory(h => [...h.filter(i => i.id !== id), newRec]);
        } else {
            setHistory(h => h.filter(i => i.id !== id));
        }
        return newRec;
      }
      return rec;
    }));
  };

  const handleDislike = (id: string) => {
    setRecommendations(prev => prev.map(rec => {
      if (rec.id === id) {
        const newRec = { ...rec, disliked: !rec.disliked, liked: false };
         // Update history
         if (newRec.disliked) {
            setHistory(h => [...h.filter(i => i.id !== id), newRec]);
        } else {
            setHistory(h => h.filter(i => i.id !== id));
        }
        return newRec;
      }
      return rec;
    }));
  };

  return {
    screen,
    setScreen,
    language,
    setLanguage,
    t,
    gender,
    setGender,
    selections,
    updateSelection,
    recommendations,
    generateRecommendations,
    handleLike,
    handleDislike,
    history,
    loading,
    userStats
  };
}
