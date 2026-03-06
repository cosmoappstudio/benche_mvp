import React, { forwardRef } from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SYMBOLS, ELEMENTS } from "@/constants/selections";
import { colors } from "@/constants/colors";
import { TRANSLATIONS } from "@/constants/translations";

const CATEGORY_COLORS: Record<string, readonly [string, string]> = {
  Food: colors.categories.Food,
  Yemek: colors.categories.Yemek,
  Playlist: colors.categories.Playlist,
  Film: colors.categories.Movie,
  Movie: colors.categories.Movie,
  Series: colors.categories.Series,
  Dizi: colors.categories.Series,
  Book: colors.categories.Book,
  Kitap: colors.categories.Kitap,
  Activity: colors.categories.Activity,
  Aktivite: colors.categories.Aktivite,
};

interface ShareStoryCardProps {
  recommendations: { category: string; title: string }[];
  color?: string | null;
  symbol?: string | null;
  element?: string | null;
  letter?: string | null;
  language?: string;
}

const getCategoryLabel = (
  category: string,
  t: { shareCard?: Record<string, string> }
): string => {
  const sc = t.shareCard;
  if (!sc) return category.toUpperCase();
  const key =
    category === "Yemek" || category === "Food"
      ? "food"
      : category === "Playlist" || category === "Çalma Listesi"
      ? "playlist"
      : category === "Film" || category === "Movie"
      ? "film"
      : category === "Series" || category === "Dizi"
      ? "series"
      : category === "Kitap" || category === "Book"
      ? "book"
      : "activity";
  return sc[key] ?? category.toUpperCase();
};

export const ShareStoryCard = forwardRef<View, ShareStoryCardProps>(
  ({ recommendations, color, symbol, element, letter, language = "tr" }, ref) => {
    const t = (TRANSLATIONS as Record<string, { results?: { shareCard?: Record<string, string> } }>)[language]?.results ?? TRANSLATIONS.tr.results;
    const shareCard = (t as { shareCard?: Record<string, string> }).shareCard ?? {};
    const colorData = color ? COLORS.find((c) => c.hex === color) : null;
    const symbolData = symbol ? SYMBOLS.find((s) => s.id === symbol) : null;
    const elementData = element ? ELEMENTS.find((e) => e.id === element) : null;

    return (
      <View
        ref={ref}
        collapsable={false}
        style={{
          width: 360,
          minHeight: 520,
          backgroundColor: colors.bg,
          borderRadius: 24,
          overflow: "hidden",
          padding: 24,
        }}
      >
        <LinearGradient
          colors={["rgba(123,47,255,0.15)", "transparent", "rgba(0,212,255,0.1)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: "absolute", inset: 0 }}
        />
        <View style={{ zIndex: 1 }}>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "800",
              color: "#fff",
              fontFamily: "Outfit-Bold",
              letterSpacing: -0.5,
            }}
          >
            BENCHE
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.6)",
              marginTop: 4,
              letterSpacing: 2,
            }}
          >
            {shareCard.dailyEnergyGuide ?? "DAILY ENERGY GUIDE"}
          </Text>

          {/* Selection circles */}
          <View
            style={{
              flexDirection: "row",
              marginTop: 24,
              alignItems: "center",
              gap: 12,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colorData?.hex ?? colors.primaryStart,
                borderWidth: 2,
                borderColor: "rgba(255,255,255,0.3)",
              }}
            />
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: symbolData?.gradient?.[0] ?? colors.primaryEnd,
                borderWidth: 2,
                borderColor: "rgba(255,255,255,0.3)",
              }}
            />
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: elementData?.gradient?.[0] ?? "#34C759",
                borderWidth: 2,
                borderColor: "rgba(255,255,255,0.3)",
              }}
            />
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.2)",
                borderWidth: 2,
                borderColor: "rgba(255,255,255,0.3)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                {letter ?? "?"}
              </Text>
            </View>
          </View>

          {/* Recommendations list */}
          <View style={{ marginTop: 28, gap: 12 }}>
            {recommendations.map((rec, i) => {
              const grad = CATEGORY_COLORS[rec.category] ?? colors.categories.Aktivite;
              const catLabel = getCategoryLabel(rec.category, { shareCard });
              return (
                <View
                  key={`${rec.category}-${rec.title}-${i}`}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 4,
                      height: 24,
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <LinearGradient
                      colors={[...grad]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={{ flex: 1 }}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#fff",
                      fontWeight: "600",
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    {catLabel}: {rec.title}
                  </Text>
                </View>
              );
            })}
          </View>

          <Text
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              marginTop: 32,
              textAlign: "center",
            }}
          >
            benche.app
          </Text>
        </View>
      </View>
    );
  }
);

ShareStoryCard.displayName = "ShareStoryCard";
