import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

export function Button({ 
  className, 
  variant = "primary", 
  size = "md", 
  fullWidth = false,
  children, 
  ...props 
}: ButtonProps) {
  const baseStyles = "rounded-2xl font-display font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-[var(--color-primary-start)] to-[var(--color-primary-end)] text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40",
    secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/10",
    ghost: "bg-transparent text-white/70 hover:text-white hover:bg-white/5",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
