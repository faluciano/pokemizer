import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team History",
  description:
    "View your saved Pokemon teams from previous Pokemizer games. Track your team building history across all generations.",
  alternates: {
    canonical: "https://pokemizer.com/history",
  },
};

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
