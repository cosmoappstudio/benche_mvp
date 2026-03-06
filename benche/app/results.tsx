import { useState, useRef } from "react";
import { View, Text, Pressable, ScrollView, Linking, Share, Modal } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { ShareStoryCard } from "@/components/cards/ShareStoryCard";
import { useSelectionStore } from "@/stores/selectionStore";
import { useFeedbackStore } from "@/stores/feedbackStore";
import { useUserStore } from "@/stores/userStore";
import { useRecommendationsStore } from "@/stores/recommendationsStore";
import { upsertFeedback } from "@/lib/db";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SYMBOLS, ELEMENTS } from "@/constants/selections";
import { getSelectionLabel } from "@/lib/i18n";
import { colors } from "@/constants/colors";
import { TRANSLATIONS } from "@/constants/translations";
import { getRecommendationLink } from "@/lib/recommendationLinks";

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
};

export default function ResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { color, symbol, element, letter, number, cardId, reset } = useSelectionStore();
  const { liked, disliked, addFeedback } = useFeedbackStore();
  const { recommendations: storeRecs, error: recError, reset: resetRecommendations } = useRecommendationsStore();
  const supabaseUserId = useUserStore((s) => s.supabaseUserId);
  const language = useUserStore((s) => s.language);
  const locationCountryCode = useUserStore((s) => s.locationCountryCode);
  const t = TRANSLATIONS[language] ?? TRANSLATIONS.en;

  const recommendations = storeRecs.map((rec) => ({
    ...rec,
    liked: liked.includes(`${rec.category}:${rec.title}`),
    disliked: disliked.includes(`${rec.category}:${rec.title}`),
  }));

  const feedbackCount = recommendations.filter(
    (r) => r.liked || r.disliked
  ).length;
  const showProgress = feedbackCount < 5;

  const symbolLabel = symbol ? getSelectionLabel("symbol", symbol, language) : "";
  const elementLabel = element ? getSelectionLabel("element", element, language) : "";
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const storyRef = useRef<View>(null);

  const handleCreateNew = () => {
    reset();
    resetRecommendations();
    router.replace("/selection");
  };

  const handleLike = (id: string, category: string, title: string) => {
    addFeedback(category, title, true);
    if (supabaseUserId && cardId) {
      upsertFeedback({
        userId: supabaseUserId,
        cardId,
        category,
        recommendation: title,
        liked: true,
      });
    }
  };

  const handleShareStory = () => {
    setShareModalVisible(true);
  };

  const handleCaptureAndShare = async () => {
    try {
      const { captureRef } = await import("react-native-view-shot");
      const uri = await captureRef(storyRef as React.RefObject<View>, { format: "png", quality: 1 });
      if (uri) {
        await Share.share({
          message: (t.results as { shareStory?: string }).shareStory ?? "My Benche daily plan",
          url: uri,
          title: "Benche",
        });
        setShareModalVisible(false);
      }
    } catch (err) {
      console.warn("Share failed:", err);
    }
  };

  const handleDislike = (id: string, category: string, title: string) => {
    addFeedback(category, title, false);
    if (supabaseUserId && cardId) {
      upsertFeedback({
        userId: supabaseUserId,
        cardId,
        category,
        recommendation: title,
        liked: false,
      });
    }
  };

  if (recommendations.length === 0) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bg }}>
        <View className="flex-1 items-center justify-center p-6">
        <Pressable
          onPress={() => router.replace("/(tabs)")}
          className="absolute top-6 right-6 p-2 rounded-full z-10"
          style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
        >
          <Icon name="LogOut" size={20} color="#A0A0C0" />
        </Pressable>
        <View className="items-center">
          <Icon name="Sparkles" size={64} color={colors.gradPrimary[1]} />
          <Text className="text-4xl font-bold text-white mt-6 text-center">
            {t.home.title}
          </Text>
          <Text className="text-lg text-white/60 mt-2 text-center">
            {t.home.subtitle}
          </Text>
          <View className="mt-8 w-full max-w-xs">
            <Button onPress={handleCreateNew} fullWidth size="lg">
              {t.home.button}
            </Button>
          </View>
        </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: 200 + insets.bottom,
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Chips - UX: min 44px touch target, belirgin seçim */}
        <View className="flex-row items-center gap-3 mb-4">
          <Pressable
            onPress={() => router.replace("/(tabs)")}
            className="p-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="ArrowLeft" size={22} color="#A0A0C0" />
          </Pressable>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1, minWidth: 0 }}
            contentContainerStyle={{ gap: 10, flexGrow: 0, alignItems: "center" }}
          >
            {color && (
              <View
                className="px-4 py-2.5 rounded-full flex-row items-center gap-2.5 min-h-[44px]"
                style={{
                  backgroundColor: "rgba(255,255,255,0.12)",
                  borderWidth: 1.5,
                  borderColor: "rgba(255,255,255,0.25)",
                }}
              >
                <View
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <Text className="text-sm font-medium text-white">{t.results.colorLabel}</Text>
              </View>
            )}
            {symbol && (
              <View
                className="px-4 py-2.5 rounded-full flex-row items-center gap-2.5 min-h-[44px]"
                style={{
                  backgroundColor: "rgba(255,255,255,0.12)",
                  borderWidth: 1.5,
                  borderColor: "rgba(255,255,255,0.25)",
                }}
              >
                <Icon
                  name={SYMBOLS.find((s) => s.id === symbol)?.icon ?? ""}
                  size={16}
                  color="#fff"
                />
                <Text className="text-sm font-medium text-white">{symbolLabel}</Text>
              </View>
            )}
            {element && (
              <View
                className="px-4 py-2.5 rounded-full flex-row items-center gap-2.5 min-h-[44px]"
                style={{
                  backgroundColor: "rgba(255,255,255,0.12)",
                  borderWidth: 1.5,
                  borderColor: "rgba(255,255,255,0.25)",
                }}
              >
                <Text className="text-base">
                  {ELEMENTS.find((e) => e.id === element)?.emoji}
                </Text>
                <Text className="text-sm font-medium text-white">{elementLabel}</Text>
              </View>
            )}
            {letter && (
              <View
                className="px-4 py-2.5 rounded-full flex-row items-center gap-2.5 min-h-[44px]"
                style={{
                  backgroundColor: "rgba(255,255,255,0.12)",
                  borderWidth: 1.5,
                  borderColor: "rgba(255,255,255,0.25)",
                }}
              >
                <Icon name="Type" size={16} color="#fff" />
                <Text className="text-sm font-medium text-white">{letter}</Text>
              </View>
            )}
          </ScrollView>
        </View>

        <View className="mt-4 mb-6">
          <MaskedView
            maskElement={
              <Text
                className="text-2xl font-bold mb-2"
                style={{ fontFamily: "Outfit-Bold" }}
                numberOfLines={2}
              >
                {t.results.title}
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
                {t.results.title}
              </Text>
            </LinearGradient>
          </MaskedView>
          <Text className="text-base text-white/60">{t.results.subtitle}</Text>
        </View>

        {/* Error Banner */}
        {recError && (
          <View
            className="mb-6 rounded-xl p-4 flex-row items-center gap-3"
            style={{
              backgroundColor: "rgba(255,45,85,0.2)",
              borderWidth: 1,
              borderColor: "rgba(255,45,85,0.3)",
            }}
          >
            <Text className="text-xl">⚠️</Text>
            <View className="flex-1">
              <Text className="text-sm font-medium text-white">
                {t.results.errorTitle}
              </Text>
              <Text className="text-xs text-white/70">{recError}</Text>
            </View>
          </View>
        )}

        {/* Progress Bar */}
        {showProgress && (
          <View
            className="mb-6 rounded-xl p-3 flex-row items-center gap-3"
            style={{
              backgroundColor: "rgba(123,47,255,0.2)",
              borderWidth: 1,
              borderColor: "rgba(123,47,255,0.2)",
            }}
          >
            <Text className="text-xl">🧠</Text>
            <View className="flex-1">
              <Text className="text-sm font-medium text-white">
                {5 - feedbackCount} {t.results.feedbackMore}
              </Text>
              <Text className="text-xs text-white/60">
                {t.results.feedbackDesc}
              </Text>
            </View>
          </View>
        )}

        {/* Recommendations */}
        <View className="gap-4">
          {recommendations.map((rec) => {
            const catStyle =
              CATEGORIES[rec.category] ?? CATEGORIES.Activity ?? CATEGORIES.Aktivite;
            const isDisliked = rec.disliked;

            return (
              <View key={rec.id} className="relative">
                <GlassCard
                  style={{
                    opacity: isDisliked ? 0.6 : 1,
                    paddingLeft: 16,
                  }}
                >
                  {/* Category strip - 4px gradient */}
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
                  <View className="flex-1">
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-row items-center gap-2">
                        <Icon
                          name={catStyle.icon}
                          size={16}
                          color="#A0A0C0"
                        />
                        <Text className="text-sm text-white/60 uppercase tracking-wider font-medium">
                          {(t.categories as Record<string, string>)[rec.category.toLowerCase()] ?? rec.category}
                        </Text>
                      </View>
                      <View className="flex-row gap-3">
                        <Pressable
                          onPress={() =>
                            handleDislike(rec.id, rec.category, rec.title)
                          }
                          className="p-1.5 rounded-full"
                          style={{
                            backgroundColor: rec.disliked
                              ? colors.disliked
                              : "rgba(255,255,255,0.05)",
                          }}
                        >
                          <Icon
                            name="ThumbsDown"
                            size={16}
                            color={rec.disliked ? "#fff" : "rgba(255,255,255,0.3)"}
                          />
                        </Pressable>
                        <Pressable
                          onPress={() =>
                            handleLike(rec.id, rec.category, rec.title)
                          }
                          className="p-1.5 rounded-full"
                          style={{
                            backgroundColor: rec.liked
                              ? colors.liked
                              : "rgba(255,255,255,0.05)",
                            ...(rec.liked && {
                              shadowColor: colors.liked,
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.5,
                              shadowRadius: 10,
                              elevation: 6,
                            }),
                          }}
                        >
                          <Icon
                            name="Heart"
                            size={16}
                            color={rec.liked ? "#fff" : "rgba(255,255,255,0.3)"}
                          />
                        </Pressable>
                      </View>
                    </View>
                    <Text
                      className="text-lg font-bold text-white mb-1"
                      style={isDisliked ? { textDecorationLine: "line-through" } : {}}
                    >
                      {rec.title}
                    </Text>
                    <Text className="text-sm text-white/70 mb-3">
                      {rec.description}
                    </Text>
                    <Text
                      className="text-xs text-white/50 italic border-l-2 pl-2"
                      style={{ borderColor: "rgba(255,255,255,0.1)" }}
                    >
                      "{rec.reason}"
                    </Text>
                    {/* Link / Platform - her zaman göster, fallback ile çalışır link */}
                    {(() => {
                      const link = getRecommendationLink(
                        rec.category,
                        rec.title,
                        rec.link,
                        locationCountryCode
                      );
                      const linkLabel =
                        rec.category === "Yemek" || rec.category === "Food"
                          ? t.results.recipe
                          : rec.category === "Book" || rec.category === "Kitap"
                          ? (t.results as { buy?: string }).buy ?? t.results.open
                          : rec.category === "Playlist" || rec.category === "Çalma Listesi"
                          ? (t.results as { listen?: string }).listen ?? t.results.open
                          : t.results.open;
                      return (
                        <View
                          className="mt-4 pt-3"
                          style={{
                            borderTopWidth: 1,
                            borderTopColor: "rgba(255,255,255,0.1)",
                          }}
                        >
                          {rec.platform &&
                          (rec.category === "Film" ||
                            rec.category === "Series" ||
                            rec.category === "Dizi") ? (
                            <View className="flex-row items-center justify-between gap-2 py-2 flex-wrap">
                              <View className="flex-row items-center gap-2">
                                <Icon name="MonitorPlay" size={16} color="#A0A0C0" />
                                <Text className="text-sm text-white/70">
                                  {(t.results as { platform?: string }).platform ?? "Platform"}:{" "}
                                  {rec.platform}
                                </Text>
                              </View>
                              {link && (
                                <Pressable
                                  onPress={() => link && Linking.openURL(link)}
                                  className="flex-row items-center gap-2 py-2 px-3 rounded-xl"
                                  style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                                >
                                  <Icon name="ExternalLink" size={14} color={colors.primaryEnd} />
                                  <Text className="text-sm font-semibold" style={{ color: colors.primaryEnd }}>
                                    {t.results.open}
                                  </Text>
                                </Pressable>
                              )}
                            </View>
                          ) : link ? (
                            <Pressable
                              onPress={() => Linking.openURL(link)}
                              className="flex-row items-center justify-center gap-2 rounded-xl py-3 px-4"
                              style={{
                                backgroundColor: "#fff",
                                minHeight: 48,
                              }}
                            >
                              <Icon name="ExternalLink" size={16} color="#000" />
                              <Text className="text-sm font-bold text-black">{linkLabel}</Text>
                            </Pressable>
                          ) : null}
                        </View>
                      );
                    })()}
                  </View>
                </GlassCard>
                {isDisliked && (
                  <View
                    className="absolute inset-0 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
                  >
                    <View
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
                    >
                      <Text className="text-xs text-white">
                        {t.results.hidden}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Actions - UX: büyük touch alanı, net feedback */}
      <View
        className="absolute left-0 right-0 bottom-0 px-6 pt-4 gap-3"
        style={{
          backgroundColor: colors.bg,
          paddingBottom: Math.max(insets.bottom, 20),
        }}
      >
        <Pressable
          onPress={handleCreateNew}
          className="w-full rounded-2xl overflow-hidden"
          style={({ pressed }) => ({ minHeight: 56, opacity: pressed ? 0.9 : 1 })}
        >
          <LinearGradient
            colors={colors.gradPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              paddingVertical: 18,
              paddingHorizontal: 24,
            }}
          >
            <Icon name="RefreshCw" size={20} color="#fff" />
            <Text className="text-white font-bold text-lg">{t.results.createNew}</Text>
          </LinearGradient>
        </Pressable>
        <Pressable
          onPress={handleShareStory}
          className="w-full rounded-2xl flex-row items-center justify-center gap-2 py-4"
          style={({ pressed }) => ({
            backgroundColor: pressed ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.1)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.2)",
            minHeight: 52,
          })}
        >
          <Icon name="Share" size={18} color="#fff" />
          <Text className="text-white font-semibold text-base">{t.results.share}</Text>
        </Pressable>
      </View>

      {/* Share Story Modal */}
      <Modal
        visible={shareModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.85)",
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <View ref={storyRef} collapsable={false}>
            <ShareStoryCard
              recommendations={recommendations.map((r) => ({ category: r.category, title: r.title }))}
              color={color}
              symbol={symbol}
              element={element}
              letter={letter}
              language={language}
            />
          </View>
          <View className="flex-row gap-3 mt-6 w-full max-w-[360px]">
            <Pressable
              onPress={() => setShareModalVisible(false)}
              className="flex-1 py-3 rounded-xl items-center"
              style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <Text className="text-white font-semibold">
                {(t.results as { shareCard?: { close?: string } }).shareCard?.close ?? "Close"}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleCaptureAndShare}
              className="flex-1 rounded-xl overflow-hidden"
            >
              <LinearGradient
                colors={colors.gradPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 14, alignItems: "center", justifyContent: "center" }}
              >
                <Text className="text-white font-semibold">{t.results.share}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
