import React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "motion/react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function GlassCard({ children, className, hoverEffect = false, ...props }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "glass-card p-4 relative overflow-hidden",
        hoverEffect && "hover:bg-white/10 transition-colors cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
