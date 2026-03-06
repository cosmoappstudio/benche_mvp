import React from "react";
import {
  View,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";

const MAX_CONTENT_WIDTH = 480;

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  centered?: boolean;
  padding?: number;
  /** Ekranın altında tab bar vb. varsa ekstra padding */
  bottomPadding?: number;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

/**
 * Responsive ekran wrapper. Tüm cihaz boyutlarında taşma olmadan düzgün görünür.
 * - Safe area insets uygular
 * - İçeriği max 480px'te ortalar (tablet için)
 * - Scroll veya sabit layout
 */
export function Screen({
  children,
  scroll = false,
  centered = false,
  padding = 24,
  bottomPadding = 0,
  style,
  contentContainerStyle,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: insets.top,
    paddingBottom: Math.max(insets.bottom, bottomPadding),
    paddingHorizontal: padding,
  };

  const contentStyle: ViewStyle = {
    flexGrow: scroll ? 1 : undefined,
    width: "100%",
    maxWidth: Math.min(width - padding * 2, MAX_CONTENT_WIDTH),
    alignSelf: "center",
    ...(centered && { justifyContent: "center" as const }),
  };

  if (scroll) {
    return (
      <ScrollView
        style={[styles.scroll, containerStyle, style]}
        contentContainerStyle={[contentStyle, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[containerStyle, style]}>
      <View style={[contentStyle, contentContainerStyle, { flex: 1 }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
});
