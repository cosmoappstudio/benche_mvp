import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  Switch,
  Modal,
  Linking,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { useUserStore } from "@/stores/userStore";
import { useFeedbackStore } from "@/stores/feedbackStore";
import { SYMBOLS, ELEMENTS } from "@/constants/selections";
import { useSelectionStore } from "@/stores/selectionStore";
import { useRecommendationsStore } from "@/stores/recommendationsStore";
import {
  getDailyCards,
  getDailyCardById,
  getProfileShortId,
  updateProfilePushToken,
  type DailyCardRow,
} from "@/lib/db";
import { requestNotificationPermission } from "@/lib/permissions";
import { getLegalUrls } from "@/lib/appConfig";
import { getVibeForCard } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import { presentPaywallForPlacement, PLACEMENT } from "@/lib/paywall";
import { Icon } from "@/components/ui/Icon";
import { colors } from "@/constants/colors";
import { TRANSLATIONS } from "@/constants/translations";
import { LANGUAGES } from "@/constants/languages";
import type { Language } from "@/stores/userStore";

type DateGroup = "today" | "yesterday" | "thisWeek" | "older";

function getDateGroup(createdAt: string): DateGroup {
  const d = new Date(createdAt);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const cardDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor((today.getTime() - cardDate.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays <= 7) return "thisWeek";
  return "older";
}

function formatCardDate(createdAt: string, locale: string): string {
  const d = new Date(createdAt);
  return d.toLocaleDateString(locale, { month: "short", day: "numeric" });
}

async function openUrl(url: string): Promise<void> {
  const trimmed = url?.trim();
  if (!trimmed) return;
  try {
    await Linking.openURL(trimmed);
  } catch {
    // URL açılamadı
  }
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const language = useUserStore((s) => s.language);
  const t = TRANSLATIONS[language] ?? TRANSLATIONS.en;

  const router = useRouter();
  const {
    supabaseUserId,
    isPro,
    notificationsEnabled,
    setLanguage,
    setNotificationsEnabled,
    totalPlansCreated,
    lastColor,
    lastSymbol,
    lastElement,
  } = useUserStore();
  const { liked, disliked } = useFeedbackStore();
  const setCardId = useSelectionStore((s) => s.setCardId);
  const setFromCard = useSelectionStore((s) => s.setFromCard);
  const setRecommendations = useRecommendationsStore((s) => s.setRecommendations);

  const [cards, setCards] = useState<(DailyCardRow & { liked_count: number; disliked_count: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shortId, setShortId] = useState<string | null>(null);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [legalUrls, setLegalUrls] = useState<Awaited<ReturnType<typeof getLegalUrls>> | null>(null);

  const fetchCards = useCallback(async () => {
    if (!supabaseUserId) {
      setCards([]);
      setLoading(false);
      return;
    }
    const data = await getDailyCards(supabaseUserId);
    setCards(data);
    setLoading(false);
    setRefreshing(false);
  }, [supabaseUserId]);

  useEffect(() => {
    setLoading(true);
    fetchCards();
  }, [fetchCards]);

  useEffect(() => {
    if (supabaseUserId) {
      getProfileShortId(supabaseUserId).then(setShortId);
    } else {
      setShortId(null);
    }
  }, [supabaseUserId]);

  useEffect(() => {
    getLegalUrls().then(setLegalUrls);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCards();
    getLegalUrls().then(setLegalUrls);
  }, [fetchCards]);

  const userIdDisplay = shortId ?? (supabaseUserId ? "…" : "USER-GUEST");
  const avatarChar = userIdDisplay.startsWith("BEN-")
    ? userIdDisplay[4]
    : userIdDisplay === "USER-GUEST"
    ? "G"
    : "?";

  const localeMap: Record<string, string> = { tr: "tr-TR", de: "de-DE", es: "es-ES" };
  const locale = localeMap[language] ?? "en-US";
  const grouped = cards.reduce<Record<DateGroup, typeof cards>>(
    (acc, card) => {
      const g = getDateGroup(card.created_at);
      if (!acc[g]) acc[g] = [];
      acc[g].push(card);
      return acc;
    },
    { today: [], yesterday: [], thisWeek: [], older: [] }
  );
  const groupLabels: Record<DateGroup, string> = {
    today: t.history?.today ?? "Today",
    yesterday: t.history?.yesterday ?? "Yesterday",
    thisWeek: t.history?.thisWeek ?? "This Week",
    older: t.history?.older ?? "Older",
  };

  const currentLang = LANGUAGES.find((l) => l.code === language);
  const rateUrl = Platform.OS === "ios" ? legalUrls?.appStore : legalUrls?.playStore;

  const handleCardPress = useCallback(
    async (card: (typeof cards)[0]) => {
      if (!supabaseUserId) return;
      const full = await getDailyCardById(supabaseUserId, card.id);
      if (full?.recommendations && Array.isArray(full.recommendations) && full.recommendations.length > 0) {
        setFromCard({
          selected_color: full.selected_color,
          selected_symbol: full.selected_symbol,
          selected_element: full.selected_element,
          selected_letter: full.selected_letter,
          selected_number: full.selected_number,
        });
        const recs = (full.recommendations as { category?: string; title?: string; description?: string; reason?: string; link?: string; platform?: string }[]).map((r, i) => ({
          id: String(i + 1),
          category: r.category ?? "Aktivite",
          title: r.title ?? "",
          description: r.description ?? "",
          reason: r.reason ?? "",
          link: r.link,
          platform: r.platform,
        }));
        setRecommendations(recs);
        setCardId(card.id);
        router.push("/results");
      } else {
        setFromCard({
          selected_color: card.selected_color,
          selected_symbol: card.selected_symbol,
          selected_element: card.selected_element,
          selected_letter: card.selected_letter,
          selected_number: card.selected_number,
        });
        router.push("/selection");
      }
    },
    [supabaseUserId, setFromCard, setRecommendations, setCardId, router]
  );

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="rgba(255,255,255,0.6)"
        />
      }
      className="flex-1"
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingHorizontal: 24,
        paddingBottom: insets.bottom + 80,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="mb-6">
        <MaskedView
          maskElement={
            <Text
              className="text-2xl font-bold mb-1"
              style={{ fontFamily: "Outfit-Bold" }}
              numberOfLines={1}
            >
              {t.profile?.title ?? "Profil"}
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
              className="text-2xl font-bold mb-1"
              style={{ fontFamily: "Outfit-Bold", opacity: 0 }}
              numberOfLines={1}
            >
              {t.profile?.title ?? "Profil"}
            </Text>
          </LinearGradient>
        </MaskedView>
      </View>

      {/* User Card */}
      <View
        className="rounded-2xl p-4 mb-6"
        style={{
          backgroundColor: "rgba(255,255,255,0.06)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.1)",
        }}
      >
        <View className="flex-row items-center gap-4 mb-4">
          <View
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.gradPrimary[0] }}
          >
            <Text className="text-xl font-bold text-white">{avatarChar}</Text>
          </View>
          <View className="flex-1 min-w-0">
            <Text className="text-base font-semibold text-white">Guest User</Text>
            <Text className="text-xs text-white/50">{userIdDisplay}</Text>
            <View className="flex-row items-center gap-2 mt-2">
              {isPro ? (
                <View
                  className="px-2.5 py-1 rounded-md"
                  style={{ backgroundColor: "#FFD700" }}
                >
                  <Text className="text-xs font-bold text-black">{t.profile?.pro ?? "PRO"}</Text>
                </View>
              ) : (
                <Pressable
                  onPress={async () => {
                    track("paywall_opened", { source: "profile" });
                    await presentPaywallForPlacement(PLACEMENT.PROFILE);
                  }}
                  className="rounded-xl overflow-hidden min-h-[44px]"
                  style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
                >
                  <LinearGradient
                    colors={[colors.primaryStart, colors.primaryEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      minHeight: 44,
                    }}
                  >
                    <View style={{ marginRight: 8 }}>
                      <Icon name="Sparkles" size={16} color="#fff" />
                    </View>
                    <Text className="text-sm font-bold text-white">
                      {(t.profile as { goPro?: string }).goPro ?? "PRO'ya Geç"}
                    </Text>
                  </LinearGradient>
                </Pressable>
              )}
            </View>
            {!isPro && (
              <Text className="text-xs text-white/40 mt-1">
                {(t.profile as { goProSubtitle?: string }).goProSubtitle ?? "Tüm özelliklere eriş"}
              </Text>
            )}
          </View>
        </View>

        {/* Like / Dislike */}
        <View
          className="flex-row justify-around items-center py-3 rounded-xl mb-4"
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.06)",
          }}
        >
          <View className="flex-row items-center gap-2">
            <Icon name="Heart" size={18} color={colors.liked} />
            <Text className="text-base font-semibold text-white">{liked.length}</Text>
          </View>
          <View className="w-px h-5" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
          <View className="flex-row items-center gap-2">
            <Icon name="ThumbsDown" size={18} color={colors.disliked} />
            <Text className="text-base font-semibold text-white">{disliked.length}</Text>
          </View>
        </View>

        {/* Plans Created */}
        {totalPlansCreated > 0 && (
          <View
            className="pt-4"
            style={{ borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" }}
          >
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm text-white/60">{t.stats?.plansCreated ?? "Oluşturulan Plan"}</Text>
              <Text className="text-xl font-bold text-white">{totalPlansCreated}</Text>
            </View>
            <View className="flex-row justify-between gap-2">
              <View className="flex-1 items-center gap-1">
                <View
                  className="w-10 h-10 rounded-full"
                  style={{
                    backgroundColor: lastColor ?? "#FF8C00",
                    borderWidth: 2,
                    borderColor: "rgba(255,255,255,0.2)",
                  }}
                />
                <Text className="text-[10px] text-white/50 uppercase" numberOfLines={1}>
                  {t.stats?.orange ?? "ENERJİ"}
                </Text>
              </View>
              <View className="flex-1 items-center gap-1">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                >
                  <Icon
                    name={SYMBOLS.find((s) => s.id === lastSymbol)?.icon ?? "Zap"}
                    size={20}
                    color="#fff"
                  />
                </View>
                <Text className="text-[10px] text-white/50 uppercase" numberOfLines={1}>
                  {t.stats?.energy ?? "ENERJİ"}
                </Text>
              </View>
              <View className="flex-1 items-center gap-1">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                >
                  <Text className="text-lg">
                    {ELEMENTS.find((e) => e.id === lastElement)?.emoji ?? "☕"}
                  </Text>
                </View>
                <Text className="text-[10px] text-white/50 uppercase" numberOfLines={1}>
                  {t.stats?.chill ?? "RAHAT"}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Past Cards - compact list */}
      <Text className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
        {t.profile?.pastCards ?? "Geçmiş Kartlar"}
      </Text>

      {loading ? (
        <View className="items-center py-12">
          <Text className="text-white/40">{t.history?.loading ?? "Loading..."}</Text>
        </View>
      ) : cards.length === 0 ? (
        <View className="items-center py-10 px-4">
          <View
            className="w-14 h-14 rounded-2xl items-center justify-center mb-3"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <Icon name="RefreshCw" size={28} color="rgba(255,255,255,0.4)" />
          </View>
          <Text className="text-white/50 text-center mb-4 text-sm">
            {t.history?.empty ?? "Henüz kart yok"}
          </Text>
          <Pressable
            onPress={() => router.push("/selection")}
            className="rounded-xl py-3 px-6 min-h-[44px] items-center justify-center"
            style={{ backgroundColor: colors.gradPrimary[0] }}
          >
            <Text className="font-semibold text-white text-sm">{t.history?.discover ?? "Keşfet"}</Text>
          </Pressable>
        </View>
      ) : (
        <View
          className="rounded-2xl overflow-hidden mb-2"
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          {(["today", "yesterday", "thisWeek", "older"] as const).map((groupKey) => {
            const groupCards = grouped[groupKey];
            if (!groupCards?.length) return null;
            return (
              <View key={groupKey}>
                <View className="px-4 py-2" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                  <Text className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                    {groupLabels[groupKey]}
                  </Text>
                </View>
                {groupCards.map((card) => {
                  const { vibe, emoji } = getVibeForCard(
                    card.selected_symbol,
                    card.selected_element,
                    language
                  );
                  const isToday = groupKey === "today";
                  return (
                    <Pressable
                      key={card.id}
                      onPress={() => handleCardPress(card)}
                      className="flex-row items-center gap-3 px-4 py-3 border-b border-white/5"
                      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                    >
                      <Text className="text-2xl w-10 text-center">{emoji}</Text>
                      <View className="flex-1 min-w-0">
                        <Text className="text-sm font-semibold text-white" numberOfLines={1}>
                          {vibe}
                        </Text>
                        <Text className="text-xs text-white/40">
                          {formatCardDate(card.created_at, locale)}
                          {isToday && " • " + (groupLabels.today ?? "Today")}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <Text className="text-xs text-white/50">❤ {card.liked_count}</Text>
                        <Text className="text-xs text-white/50">👎 {card.disliked_count}</Text>
                      </View>
                      <Icon name="ChevronRight" size={16} color="rgba(255,255,255,0.6)" />
                    </Pressable>
                  );
                })}
              </View>
            );
          })}
        </View>
      )}

      {/* Settings */}
      <View
        className="rounded-2xl overflow-hidden mt-6 mb-2"
        style={{
          backgroundColor: "rgba(255,255,255,0.06)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.1)",
        }}
      >
        <View className="p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <Text className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
            {t.settings.title}
          </Text>
          <Text className="text-base font-semibold text-white mb-2">{t.settings.language}</Text>
          <Pressable
            onPress={() => setLangModalVisible(true)}
            className="flex-row items-center justify-between py-3 px-4 rounded-xl min-h-[44px]"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <View className="flex-row items-center gap-2">
              <Text className="text-lg">{currentLang?.flag ?? "🌐"}</Text>
              <Text className="text-white font-medium">{currentLang?.name ?? language}</Text>
            </View>
            <Icon name="ChevronDown" size={20} color="rgba(255,255,255,0.5)" />
          </Pressable>
        </View>

        <View className="flex-row items-center justify-between py-4 px-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <View className="flex-row items-center gap-3">
            <Icon name="Bell" size={20} color="#A0A0C0" />
            <Text className="text-white font-medium">{t.settings.notifications}</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={async (value) => {
              if (value) {
                const { granted, expoPushToken } = await requestNotificationPermission();
                setNotificationsEnabled(granted);
                if (granted && supabaseUserId) {
                  await updateProfilePushToken(supabaseUserId, expoPushToken);
                }
              } else {
                setNotificationsEnabled(false);
                if (supabaseUserId) {
                  await updateProfilePushToken(supabaseUserId, null);
                }
              }
            }}
            trackColor={{ false: "rgba(255,255,255,0.2)", true: "#00C851" }}
            thumbColor="#fff"
          />
        </View>

        <Pressable
          className="flex-row items-center justify-between py-4 px-4 border-b"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <View className="flex-row items-center gap-3">
            <Icon name="RefreshCw" size={20} color="#A0A0C0" />
            <Text className="text-white font-medium">{t.settings.restorePurchase}</Text>
          </View>
          <Icon name="ChevronRight" size={18} color="rgba(255,255,255,0.4)" />
        </Pressable>

        <Pressable
          onPress={() => openUrl(legalUrls?.privacyPolicy ?? "")}
          className="flex-row items-center justify-between py-4 px-4 border-b"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <View className="flex-row items-center gap-3">
            <Icon name="FileText" size={20} color="#A0A0C0" />
            <Text className="text-white font-medium">
              {(t.settings as { privacyPolicy?: string }).privacyPolicy ?? "Privacy Policy"}
            </Text>
          </View>
          <Icon name="ChevronRight" size={18} color="rgba(255,255,255,0.4)" />
        </Pressable>

        <Pressable
          onPress={() => openUrl(legalUrls?.terms ?? "")}
          className="flex-row items-center justify-between py-4 px-4 border-b"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <View className="flex-row items-center gap-3">
            <Icon name="FileText" size={20} color="#A0A0C0" />
            <Text className="text-white font-medium">
              {(t.settings as { terms?: string }).terms ?? "Terms of Service"}
            </Text>
          </View>
          <Icon name="ChevronRight" size={18} color="rgba(255,255,255,0.4)" />
        </Pressable>

        <Pressable
          onPress={() => openUrl(legalUrls?.eula ?? "")}
          className="flex-row items-center justify-between py-4 px-4 border-b"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <View className="flex-row items-center gap-3">
            <Icon name="FileText" size={20} color="#A0A0C0" />
            <Text className="text-white font-medium">
              {(t.settings as { eula?: string }).eula ?? "EULA"}
            </Text>
          </View>
          <Icon name="ChevronRight" size={18} color="rgba(255,255,255,0.4)" />
        </Pressable>

        <Pressable
          onPress={() => openUrl(rateUrl ?? "")}
          className="flex-row items-center justify-between py-4 px-4 border-b"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <View className="flex-row items-center gap-3">
            <Icon name="Star" size={20} color="#A0A0C0" />
            <Text className="text-white font-medium">
              {(t.settings as { rateUs?: string }).rateUs ?? "Rate Us"}
            </Text>
          </View>
          <Icon name="ChevronRight" size={18} color="rgba(255,255,255,0.4)" />
        </Pressable>

        <Pressable
          onPress={() => openUrl(legalUrls?.support ?? "")}
          className="flex-row items-center justify-between py-4 px-4"
        >
          <View className="flex-row items-center gap-3">
            <Icon name="MessageCircle" size={20} color="#A0A0C0" />
            <Text className="text-white font-medium">
              {(t.settings as { support?: string }).support ?? "Support"}
            </Text>
          </View>
          <Icon name="ChevronRight" size={18} color="rgba(255,255,255,0.4)" />
        </Pressable>
      </View>

      {/* Language Modal */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onPress={() => setLangModalVisible(false)}
        >
          <Pressable
            className="rounded-t-3xl p-6"
            style={{
              backgroundColor: colors.bg,
              paddingBottom: insets.bottom + 24,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-lg font-bold text-white mb-4">
              {(t.settings as { selectLanguage?: string }).selectLanguage ?? "Select language"}
            </Text>
            <View className="gap-2">
              {LANGUAGES.map((lang) => (
                <Pressable
                  key={lang.code}
                  onPress={() => {
                    setLanguage(lang.code as Language);
                    setLangModalVisible(false);
                  }}
                  className="flex-row items-center gap-3 py-4 px-4 rounded-xl min-h-[52px]"
                  style={{
                    backgroundColor: language === lang.code ? "rgba(123,47,255,0.2)" : "rgba(255,255,255,0.06)",
                    borderWidth: 1,
                    borderColor: language === lang.code ? colors.gradPrimary[0] : "rgba(255,255,255,0.1)",
                  }}
                >
                  <Text className="text-2xl">{lang.flag}</Text>
                  <Text
                    className="font-medium text-base"
                    style={{ color: language === lang.code ? "#fff" : "rgba(255,255,255,0.9)" }}
                  >
                    {lang.name}
                  </Text>
                  {language === lang.code && (
                    <View className="ml-auto w-5 h-5 rounded-full items-center justify-center" style={{ backgroundColor: colors.gradPrimary[0] }}>
                      <Text className="text-white text-xs">✓</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
