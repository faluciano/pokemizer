"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Share2, Check, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { encodeTeamShareCode } from "@/lib/share";
import type { EvolutionLine, GameVersion } from "@/lib/types";

interface ShareButtonProps {
  gameVersion: GameVersion;
  team: EvolutionLine[];
  attempts: number;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ShareButton({
  gameVersion,
  team,
  attempts,
  variant = "outline",
  size = "default",
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const code = encodeTeamShareCode(gameVersion.slug, team, attempts);
    const url = `${window.location.origin}/t/${code}`;

    const shareData = {
      title: `My ${gameVersion.displayName} Team — Pokemizer`,
      text: `Check out my ${gameVersion.displayName} team on Pokemizer!`,
      url,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        track("team_shared", { method: "native", game: gameVersion.slug });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        track("team_shared", { method: "clipboard", game: gameVersion.slug });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      // User cancelled share dialog — not an error
      if (error instanceof Error && error.name !== "AbortError") {
        // Fallback to clipboard if share fails
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          toast.success("Link copied to clipboard!");
          setTimeout(() => setCopied(false), 2000);
        } catch {
          toast.error("Could not copy link");
        }
      }
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      className={cn(className)}
    >
      {copied ? (
        <>
          <Check className="mr-2 size-4" />
          Copied!
        </>
      ) : size === "icon" ? (
        <Share2 className="size-4" />
      ) : (
        <>
          <Share2 className="mr-2 size-4" />
          Share Team
        </>
      )}
    </Button>
  );
}
