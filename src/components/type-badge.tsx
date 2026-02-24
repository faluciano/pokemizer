import { Badge } from "@/components/ui/badge";
import { TYPE_COLORS } from "@/lib/type-colors";
import type { PokemonType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TypeBadgeProps {
  type: PokemonType;
  className?: string;
}

export function TypeBadge({ type, className }: TypeBadgeProps) {
  const colors = TYPE_COLORS[type];

  return (
    <Badge
      className={cn(
        colors.bg,
        colors.text,
        "border-transparent capitalize",
        className
      )}
    >
      {type}
    </Badge>
  );
}
