import React from "react";
import { icons } from "lucide-react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  className?: string;
}

export function Icon({ name, ...props }: IconProps) {
  const LucideIcon = (icons as any)[name];

  if (!LucideIcon) {
    return null;
  }

  return <LucideIcon {...props} />;
}
