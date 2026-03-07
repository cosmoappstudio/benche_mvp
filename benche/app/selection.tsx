import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useSelectionStore } from "@/stores/selectionStore";
import { useUserStore } from "@/stores/userStore";
import { track } from "@/lib/analytics";
import { PaintDrop } from "@/components/ui/PaintDrop";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  COLORS,
  SYMBOLS,
  ELEMENTS,
  NUMBERS,
} from "@/constants/selections";
import { TRANSLATIONS } from "@/constants/translations";
import { getSelectionLabel } from "@/lib/i18n";
import { colors } from "@/constants/colors";

export default function SelectionScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const language = useUserStore((s) => s.language);
  const t = (TRANSLATIONS[language] ?? TRANSLATIONS.en).selection;

  const router = useRouter();
  const {
    color,
    symbol,
    element,
    letter,
    number,
    setColor,
    setSymbol,
    setElement,
    setLetter,
    setNumber,
  } = useSelectionStore();

  const isComplete = color && symbol && element && letter && number;

  const handleComplete = () => {
    if (isComplete) {
      track("plan_created", {
        color: color ?? "",
        symbol: symbol ?? "",
        element: element ?? "",
      });
      router.replace("/loading");
    }
  };

  const selectedColorData = COLORS.find((c) => c.hex === color);
  const selectedSymbolData = SYMBOLS.find((s) => s.id === symbol);
  const selectedElementData = ELEMENTS.find((e) => e.id === element);

  const locale = language === "tr" ? "tr-TR" : language === "de" ? "de-DE" : language === "es" ? "es-ES" : "en-US";
  const dateStr = new Date().toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
  });

  const screenPadding = 24 * 2;
  const gap = 16;
  const cardSize = Math.min(
    130,
    Math.floor((width - screenPadding - gap) / 2)
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Sticky Header - Combo View */}
        <View
          className="pb-2 border-b overflow-hidden"
          style={{
            backgroundColor: colors.bg,
            borderBottomColor: "rgba(255,255,255,0.05)",
            paddingTop: insets.top + 8,
            paddingHorizontal: 24,
          }}
        >
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xl font-bold text-white flex-1" numberOfLines={1}>
              {t.title}
            </Text>
            <View className="flex-row items-center gap-3 flex-shrink-0">
              <Text className="text-xs text-white/60 font-mono">{dateStr}</Text>
              <Pressable
                onPress={() => router.back()}
                className="p-1 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              >
                <Icon name="X" size={20} color="#A0A0C0" />
              </Pressable>
            </View>
          </View>

          {/* Combo Line - 5 steps - evenly spaced within bounds */}
          <View
            className="flex-row items-center h-12"
            style={{
              marginHorizontal: -4,
              justifyContent: "space-between",
            }}
          >
            <View
              className="absolute h-0.5 left-0 right-0"
              style={{ backgroundColor: "rgba(255,255,255,0.1)", top: 24 }}
            />
            {/* Color */}
            <View
              className="w-8 h-8 rounded-full border-2 items-center justify-center z-10"
              style={{
                backgroundColor: colors.bg,
                borderColor: color || "rgba(255,255,255,0.1)",
              }}
            >
              {color && (
                <View
                  className="w-full h-full rounded-full opacity-80"
                  style={{ backgroundColor: color }}
                />
              )}
            </View>
            {/* Symbol */}
            <View
              className="w-8 h-8 rounded-full border-2 items-center justify-center z-10"
              style={{
                backgroundColor: colors.bg,
                borderColor: symbol ? "#fff" : "rgba(255,255,255,0.1)",
              }}
            >
              {symbol && (
                <Icon
                  name={selectedSymbolData?.icon ?? ""}
                  size={16}
                  color="#fff"
                />
              )}
            </View>
            {/* Element */}
            <View
              className="w-8 h-8 rounded-full border-2 items-center justify-center z-10"
              style={{
                backgroundColor: colors.bg,
                borderColor: element ? "#fff" : "rgba(255,255,255,0.1)",
              }}
            >
              {element && (
                <Text className="text-sm">
                  {selectedElementData?.emoji}
                </Text>
              )}
            </View>
            {/* Letter */}
            <View
              className="w-8 h-8 rounded-full border-2 items-center justify-center z-10"
              style={{
                backgroundColor: colors.bg,
                borderColor: letter ? "#fff" : "rgba(255,255,255,0.1)",
              }}
            >
              <Text className="text-xs font-bold text-white">{letter}</Text>
            </View>
            {/* Number */}
            <View
              className="w-8 h-8 rounded-full border-2 items-center justify-center z-10"
              style={{
                backgroundColor: colors.bg,
                borderColor: number ? "#fff" : "rgba(255,255,255,0.1)",
              }}
            >
              <Text className="text-xs font-bold text-white">{number}</Text>
            </View>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* SECTION 1: COLOR - Paint Drops */}
          <View className="mb-12 overflow-hidden" style={{ marginHorizontal: -24 }}>
            <View className="flex-row items-center gap-2 mb-4 px-6">
              <View
                className="w-1 h-4 rounded-full"
                style={{
                  backgroundColor: "#7B2FFF",
                }}
              />
              <Text className="text-white/60 text-sm font-medium uppercase tracking-wider">
                {t.color}
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 32,
                paddingLeft: 28,
                paddingRight: 28,
                alignItems: "flex-end",
                height: 128,
              }}
            >
              {COLORS.map((c) => (
                <PaintDrop
                  key={c.id}
                  color={c.hex}
                  label={getSelectionLabel("color", c.id, language)}
                  isSelected={color === c.hex}
                  onPress={() => setColor(color === c.hex ? null : c.hex)}
                />
              ))}
            </ScrollView>
            {selectedColorData && (
              <Text className="mt-2 text-center text-sm text-white/60 italic">
                {selectedColorData.meaning}
              </Text>
            )}
          </View>

          {/* SECTION 2: SYMBOL - cards */}
          <View className="mb-12 overflow-hidden" style={{ marginHorizontal: -24 }}>
            <View className="flex-row items-center gap-2 mb-4 px-6">
              <View
                className="w-1 h-4 rounded-full"
                style={{ backgroundColor: "#FF8C00" }}
              />
              <Text className="text-white/60 text-sm font-medium uppercase tracking-wider">
                {t.symbol}
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: 16,
                paddingLeft: 28,
                paddingRight: 28,
              }}
            >
              {SYMBOLS.map((s) => {
                const isSelected = symbol === s.id;
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => setSymbol(symbol === s.id ? null : s.id)}
                    style={{
                      width: cardSize,
                      height: cardSize,
                      borderRadius: 24,
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected
                        ? "rgba(255,255,255,0.4)"
                        : "rgba(255,255,255,0.05)",
                      backgroundColor: isSelected
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(255,255,255,0.05)",
                      opacity: isSelected ? 1 : 0.6,
                      ...(isSelected && {
                        shadowColor: "#fff",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 6,
                      }),
                    }}
                  >
                    <View
                      className="absolute inset-0 rounded-3xl overflow-hidden"
                      style={{ opacity: isSelected ? 0.4 : 0.1 }}
                    >
                      <LinearGradient
                        colors={[...s.gradient]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ flex: 1 }}
                      />
                    </View>
                    <Icon
                      name={s.icon}
                      size={40}
                      color={isSelected ? "#fff" : "rgba(255,255,255,0.5)"}
                    />
                    <Text
                      className="text-sm font-medium mt-2"
                      style={{
                        color: isSelected ? "#fff" : "rgba(255,255,255,0.5)",
                      }}
                    >
                      {getSelectionLabel("symbol", s.id, language)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* SECTION 3: ELEMENT - cards */}
          <View className="mb-12 overflow-hidden" style={{ marginHorizontal: -24 }}>
            <View className="flex-row items-center gap-2 mb-4 px-6">
              <View
                className="w-1 h-4 rounded-full"
                style={{ backgroundColor: "#00C851" }}
              />
              <Text className="text-white/60 text-sm font-medium uppercase tracking-wider">
                {t.element}
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: 16,
                paddingLeft: 28,
                paddingRight: 28,
              }}
            >
              {ELEMENTS.map((e) => {
                const isSelected = element === e.id;
                return (
                  <Pressable
                    key={e.id}
                    onPress={() => setElement(element === e.id ? null : e.id)}
                    style={{
                      width: cardSize,
                      height: cardSize,
                      borderRadius: 24,
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected
                        ? "rgba(255,255,255,0.4)"
                        : "rgba(255,255,255,0.05)",
                      backgroundColor: isSelected
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(255,255,255,0.05)",
                      opacity: isSelected ? 1 : 0.6,
                      ...(isSelected && {
                        shadowColor: "#fff",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 6,
                      }),
                    }}
                  >
                    <View
                      className="absolute inset-0 rounded-3xl overflow-hidden"
                      style={{ opacity: isSelected ? 0.4 : 0.1 }}
                    >
                      <LinearGradient
                        colors={[...e.gradient]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ flex: 1 }}
                      />
                    </View>
                    <Text className="text-4xl">{e.emoji}</Text>
                    <Text
                      className="text-sm font-medium mt-2"
                      style={{
                        color: isSelected ? "#fff" : "rgba(255,255,255,0.5)",
                      }}
                    >
                      {getSelectionLabel("element", e.id, language)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* SECTION 4: LETTER - Card input */}
          <View className="mb-12 items-center">
            <View className="flex-row items-center gap-2 mb-8 self-start px-6">
              <View
                className="w-1 h-4 rounded-full"
                style={{ backgroundColor: "#FF6B9D" }}
              />
              <Text className="text-white/60 text-sm font-medium uppercase tracking-wider">
                {t.letter}
              </Text>
            </View>
            <View
              className="min-h-[200px] rounded-3xl items-center justify-center py-6"
              style={{
                width: Math.min(160, width - 48),
                borderWidth: 1,
                borderColor: letter
                  ? "rgba(255,255,255,0.4)"
                  : "rgba(255,255,255,0.1)",
                backgroundColor: letter
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(255,255,255,0.05)",
              }}
            >
              <Text className="text-xs text-white/40 uppercase tracking-widest mb-3">
                {t.initial}
              </Text>
              <TextInput
                value={letter ?? ""}
                onChangeText={(t) =>
                  setLetter(t.toUpperCase().slice(-1) || null)
                }
                placeholder="?"
                placeholderTextColor="rgba(255,255,255,0.3)"
                className="text-8xl font-bold text-white text-center w-24"
                style={{
                  lineHeight: 96,
                  paddingVertical: 0,
                  ...(Platform.OS === "android" && { includeFontPadding: false }),
                }}
                maxLength={1}
                autoCapitalize="characters"
              />
              {letter && (
                <View
                  className="mt-2 w-12 h-1 rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.5)" }}
                />
              )}
            </View>
          </View>

          {/* SECTION 5: NUMBER */}
          <View className="mb-8 items-center overflow-hidden">
            <View className="flex-row items-center gap-2 mb-8">
              <View
                className="w-1 h-4 rounded-full"
                style={{ backgroundColor: "#FFD700" }}
              />
              <Text className="text-white/60 text-sm font-medium uppercase tracking-wider">
                {t.number}
              </Text>
            </View>
            <View className="flex-row flex-wrap justify-center gap-4 max-w-xs">
              {NUMBERS.map((n) => (
                <Pressable
                  key={n.value}
                  onPress={() =>
                    setNumber(number === n.value ? null : n.value)
                  }
                  className="w-12 h-12 rounded-full items-center justify-center overflow-hidden"
                  style={{
                    backgroundColor:
                      number === n.value ? "#fff" : "rgba(255,255,255,0.1)",
                    ...(number === n.value && {
                      shadowColor: "#fff",
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.5,
                      shadowRadius: 8,
                      elevation: 6,
                    }),
                  }}
                >
                  <Text
                    className="text-xl font-bold"
                    style={{
                      color: number === n.value ? "#000" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {n.value}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* FAB - Floating Action Button */}
        <View
          className="absolute bottom-0 left-0 right-0 px-6 pt-4"
          style={{
            backgroundColor: colors.bg,
            paddingBottom: Math.max(insets.bottom, 20) + 20,
          }}
        >
          <Pressable
            onPress={handleComplete}
            disabled={!isComplete}
            style={{
              opacity: isComplete ? 1 : 0.5,
              transform: [{ translateY: isComplete ? 0 : 20 }],
            }}
          >
            {isComplete ? (
              <View
                className="rounded-2xl py-4 items-center justify-center flex-row gap-2"
                style={{
                  backgroundColor: "#fff",
                  shadowColor: "#fff",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                }}
              >
                <Text className="text-lg font-bold text-black">
                  {(t as { generateMyDay?: string }).generateMyDay ?? t.discover}
                </Text>
                <Icon name="ArrowRight" size={20} color="#000" />
              </View>
            ) : (
              <View
                className="rounded-2xl py-4 items-center justify-center"
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                }}
              >
                <Text className="text-lg font-semibold text-white/50">
                  {t.discover}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
