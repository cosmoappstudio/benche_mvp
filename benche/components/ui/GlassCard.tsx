import React from "react";
import { View, ViewProps, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { cn } from "@/lib/utils";
import { colors } from "@/constants/colors";

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({
  children,
  className,
  style,
  ...props
}: GlassCardProps) {
  const cardStyle = {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: "hidden" as const,
    position: "relative" as const,
  };

  return (
    <View
      className={cn("p-4", className)}
      style={[cardStyle, style]}
      {...props}
    >
      {Platform.OS === "ios" ? (
        <BlurView
          intensity={20}
          tint="dark"
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: colors.cardSurface,
          }}
        />
      ) : (
        <View
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: colors.cardSurface,
          }}
        />
      )}
      <View style={{ zIndex: 1, padding: 16 }}>{children}</View>
    </View>
  );
}
