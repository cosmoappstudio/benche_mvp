import React from "react";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

const ICON_MAP: Record<string, ComponentProps<typeof Ionicons>["name"]> = {
  moon: "moon",
  sun: "sunny",
  star: "star",
  wave: "water",
  mountain: "analytics",
  tree: "leaf",
  flame: "flame",
  gem: "diamond",
  eye: "eye",
  spiral: "sync",
  ArrowRight: "arrow-forward",
  ArrowLeft: "arrow-back",
  X: "close",
  Heart: "heart",
  ThumbsDown: "thumbs-down",
  Sparkles: "sparkles",
  Share: "share-social",
  RefreshCw: "refresh",
  RotateCcw: "arrow-undo-outline",
  ExternalLink: "open-outline",
  Utensils: "restaurant",
  Music: "musical-notes",
  Film: "film",
  Tv: "tv",
  Book: "book",
  Activity: "fitness",
  MonitorPlay: "play",
  MessageCircle: "chatbubble",
  LogOut: "log-out",
  Type: "create",
  House: "home",
  User: "person",
  Settings: "settings",
  Coffee: "cafe",
  Zap: "flash",
  Bell: "notifications",
  ChevronRight: "chevron-forward",
  ChevronDown: "chevron-down",
  FileText: "document-text",
  Star: "star",
  Mail: "mail",
};

interface IconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export function Icon({
  name,
  size = 24,
  color = "#fff",
  ...props
}: IconProps) {
  const ionName = ICON_MAP[name] ?? "ellipse";
  return <Ionicons name={ionName} size={size} color={color} {...props} />;
}
