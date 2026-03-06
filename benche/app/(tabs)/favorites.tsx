import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { useFeedbackStore } from "@/stores/feedbackStore";
import { useUserStore } from "@/stores/userStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { Icon } from "@/components/ui/Icon";
import { colors } from "@/constants/colors";
import { TRANSLATIONS } from "@/constants/translations";

const CATEGORIES: Record<
  string,
  { color: readonly [string, string]; icon: string }
> = {
  Food: { color: colors.categories.Food, icon: "Utensils" },
  Playlist: { color: colors.categories.Playlist, icon: "Music" },
  Movie: { color: colors.categories.Movie, icon: "Film" },
  Series: { color: colors.categories.Series, icon: "Tv" },
  Book: { color: colors.categories.Book, icon: "Book" },
  Activity: { color: colors.categories.Activity, icon: "Activity" },
  Yemek: { color: colors.categories.Yemek, icon: "Utensils" },
  Aktivite: { color: colors.categories.Aktivite, icon: "Activity" },
  Film: { color: colors.categories.Movie, icon: "Film" },
  Dizi: { color: colors.categories.Series, icon: "Tv" },
  Kitap: { color: colors.categories.Book, icon: "Book" },
  "Çalma Listesi": { color: colors.categories.Playlist, icon: "Music" },
};

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const language = useUserStore((s) => s.language);
  const t = TRANSLATIONS[language] ?? TRANSLATIONS.en;

  const { liked, disliked, removeFeedback } = useFeedbackStore();
  const [activeTab, setActiveTab] = useState<"likes" | "dislikes">("likes");

  const likesList = liked.map((key) => {
    const [category, ...rest] = key.split(":");
    return { id: key, category, title: rest.join(":") };
  });
  const dislikesList = disliked.map((key) => {
    const [category, ...rest] = key.split(":");
    return { id: key, category, title: rest.join(":") };
  });

  const items = activeTab === "likes" ? likesList : dislikesList;
  const handleRemove = (id: string) => removeFeedback(id);

  const removeLabel = (t.tasteMap as { remove?: string })?.remove ?? "Kaldır";

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: colors.bg,
        paddingTop: insets.top,
        paddingHorizontal: 24,
        paddingBottom: insets.bottom + 80,
      }}
    >
      {/* Header - gradient title like results */}
      <View className="mb-6">
        <MaskedView
          maskElement={
            <Text
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: "Outfit-Bold" }}
              numberOfLines={2}
            >
              {t.tasteMap?.title ?? "Zevk Haritası"}
            </Text>
          }
        >
          <LinearGradient
            colors={[colors.primaryStart, colors.primaryEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ paddingVertical: 4 }}
          >
            <Text
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: "Outfit-Bold", opacity: 0 }}
              numberOfLines={2}
            >
              {t.tasteMap?.title ?? "Zevk Haritası"}
            </Text>
          </LinearGradient>
        </MaskedView>
        <Text className="text-base text-white/60">
          {t.tasteMap?.subtitle ?? "Benche bunları hatırlar."}
        </Text>
      </View>

      {/* Tabs - min 44px touch target, Icon + label */}
      <View
        className="flex-row p-1.5 rounded-2xl mb-6"
        style={{
          backgroundColor: "rgba(255,255,255,0.06)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <Pressable
          onPress={() => setActiveTab("likes")}
          className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl min-h-[44px]"
          style={({ pressed }) => ({
            backgroundColor: activeTab === "likes" ? "rgba(255,77,109,0.25)" : "transparent",
            opacity: pressed ? 0.9 : 1,
            borderWidth: activeTab === "likes" ? 1 : 0,
            borderColor: "rgba(255,77,109,0.4)",
          })}
        >
          <Icon
            name="Heart"
            size={18}
            color={activeTab === "likes" ? colors.liked : "rgba(255,255,255,0.35)"}
          />
          <Text
            className="text-sm font-semibold"
            style={{ color: activeTab === "likes" ? "#fff" : "rgba(255,255,255,0.4)" }}
          >
            {t.tasteMap?.liked ?? "Beğenilen"}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("dislikes")}
          className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl min-h-[44px]"
          style={({ pressed }) => ({
            backgroundColor: activeTab === "dislikes" ? "rgba(107,114,128,0.3)" : "transparent",
            opacity: pressed ? 0.9 : 1,
            borderWidth: activeTab === "dislikes" ? 1 : 0,
            borderColor: "rgba(107,114,128,0.4)",
          })}
        >
          <Icon
            name="ThumbsDown"
            size={18}
            color={activeTab === "dislikes" ? colors.disliked : "rgba(255,255,255,0.35)"}
          />
          <Text
            className="text-sm font-semibold"
            style={{ color: activeTab === "dislikes" ? "#fff" : "rgba(255,255,255,0.4)" }}
          >
            {t.tasteMap?.disliked ?? "Beğenilmeyen"}
          </Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View className="items-center py-16 px-4">
            <View
              className="w-20 h-20 rounded-2xl items-center justify-center mb-5"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Icon
                name={activeTab === "likes" ? "Heart" : "ThumbsDown"}
                size={40}
                color={activeTab === "likes" ? colors.liked : colors.disliked}
              />
            </View>
            <Text className="text-lg font-semibold text-white text-center">
              {activeTab === "likes"
                ? (t.tasteMap?.noLikes ?? "Henüz beğeni yok")
                : (t.tasteMap?.noDislikes ?? "Olumsuz geri bildirim yok")}
            </Text>
            <Text className="text-white/50 text-sm mt-2 text-center max-w-[260px]">
              {activeTab === "likes"
                ? (t.tasteMap?.noLikesDesc ?? "Önerileri beğenmeye başla")
                : (t.tasteMap?.noDislikesDesc ?? "Beğenmediklerin burada görünecek")}
            </Text>
          </View>
        ) : (
          <View className="gap-4">
            {items.map((item) => {
              const catStyle =
                CATEGORIES[item.category] ?? CATEGORIES.Activity ?? CATEGORIES.Aktivite;
              return (
                <View key={item.id} className="relative">
                  <GlassCard style={{ paddingLeft: 16 }}>
                    <View
                      className="absolute left-0 top-0 bottom-0 rounded-l-2xl"
                      style={{ width: 4, overflow: "hidden" }}
                    >
                      <LinearGradient
                        colors={[...catStyle.color]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={{ flex: 1 }}
                      />
                    </View>
                    <View className="flex-row items-center justify-between gap-3">
                      <View className="flex-1 min-w-0">
                        <View className="flex-row items-center gap-2 mb-1">
                          <Icon
                            name={catStyle.icon}
                            size={14}
                            color="#A0A0C0"
                          />
                          <Text className="text-xs text-white/50 uppercase tracking-wider font-medium">
                            {(t.categories as Record<string, string>)[item.category.toLowerCase()] ?? item.category}
                          </Text>
                        </View>
                        <Text className="font-bold text-white" numberOfLines={2}>
                          {item.title}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => handleRemove(item.id)}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        className="flex-row items-center gap-2 py-2.5 px-3 rounded-xl min-h-[44px]"
                        style={({ pressed }) => ({
                          backgroundColor: pressed ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
                          borderWidth: 1,
                          borderColor: "rgba(255,255,255,0.1)",
                        })}
                      >
                        <Icon name="X" size={16} color="rgba(255,255,255,0.6)" />
                        <Text className="text-xs font-medium text-white/60">{removeLabel}</Text>
                      </Pressable>
                    </View>
                  </GlassCard>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
