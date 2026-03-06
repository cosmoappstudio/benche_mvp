import React from "react";
import { View, Pressable, Text, PressableProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { cn } from "@/lib/utils";
import { colors } from "@/constants/colors";

interface ButtonProps extends PressableProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children?: React.ReactNode;
  disabled?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  // Tasarıma uygun: ana butonlar py-4 (16px), rounded-2xl
  const sizes = {
    sm: "px-4 py-2.5",
    md: "px-6 py-3",
    lg: "px-6 py-4",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const isTextOnly = typeof children === "string";
  const content = isTextOnly ? (
    <Text
      className={cn(
        "font-semibold text-center",
        textSizes[size],
        variant === "primary" && "text-white",
        variant === "secondary" && "text-white",
        variant === "ghost" && "text-white/70"
      )}
    >
      {children}
    </Text>
  ) : (
    <View className="flex-row items-center justify-center gap-2">
      {children}
    </View>
  );

  if (variant === "primary") {
    return (
      <Pressable
        disabled={disabled}
        className={cn(
          "rounded-2xl overflow-hidden",
          fullWidth && "w-full",
          disabled && "opacity-50"
        )}
        {...props}
      >
        <LinearGradient
          colors={colors.gradPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className={cn("py-4 items-center justify-center", sizes[size], fullWidth && "w-full")}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      disabled={disabled}
      className={cn(
        "rounded-2xl items-center justify-center",
        sizes[size],
        fullWidth && "w-full",
        variant === "secondary" && "bg-white/10 border border-white/10",
        variant === "ghost" && "bg-transparent",
        disabled && "opacity-50"
      )}
      {...props}
    >
      {content}
    </Pressable>
  );
}
