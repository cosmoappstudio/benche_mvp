import React from "react";
import Svg, { Path } from "react-native-svg";
import { Pressable, View, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface PaintDropProps {
  color: string;
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

export function PaintDrop({ color, label, isSelected, onPress }: PaintDropProps) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(isSelected ? 1.08 : 1);
    translateY.value = withSpring(isSelected ? -6 : 0);
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <Pressable onPress={onPress}>
      <Animated.View
        style={[
          { alignItems: "center", justifyContent: "flex-end", marginHorizontal: 8 },
          animatedStyle,
          isSelected && {
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 8,
            elevation: 6,
          },
        ]}
      >
      <Svg width={64} height={80} viewBox="0 0 100 120">
        <Path
          d="M50 0 C50 0 0 60 0 85 C0 104.33 22.39 120 50 120 C77.61 120 100 104.33 100 85 C100 60 50 0 50 0 Z"
          fill={color}
        />
        <Path
          d="M30 40 Q20 60 25 80"
          stroke="white"
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.4}
          fill="none"
        />
      </Svg>
      {isSelected && (
        <View
          className="absolute -bottom-6 px-2 py-1 rounded-full"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <Text className="text-xs font-bold text-white">{label}</Text>
        </View>
      )}
      </Animated.View>
    </Pressable>
  );
}
