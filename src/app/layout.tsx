import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pokemizer.com"),
  title: {
    default: "Pokemizer",
    template: "%s | Pokemizer",
  },
  description:
    "Build your Pokemon team with the randomizer card game. Pick a generation, get a random starter, and flip cards to assemble a team of 6 under type-overlap rules.",
  keywords: [
    "pokemon",
    "team builder",
    "randomizer",
    "card game",
    "pokemon team",
    "random team",
    "nuzlocke",
    "team generator",
  ],
  openGraph: {
    title: "Pokemizer",
    description:
      "Build your Pokemon team with the randomizer card game. Pick a generation, get a random starter, and flip cards to assemble a team of 6.",
    url: "https://pokemizer.com",
    siteName: "Pokemizer",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pokemizer",
    description:
      "Build your Pokemon team with the randomizer card game. Pick a generation, get a random starter, and flip cards to assemble a team of 6.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://pokemizer.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-zinc-950">{children}</div>
        <footer className="border-t border-zinc-800 bg-zinc-950 px-4 py-6 text-center text-xs leading-relaxed text-zinc-600">
          <p>
            Pokemizer is an unofficial fan project and is not affiliated with,
            endorsed, or supported by Nintendo, Game Freak, or The Pokemon
            Company.
          </p>
          <p className="mt-1">
            Pokemon and Pokemon character names are trademarks of Nintendo.
          </p>
        </footer>
        <Toaster />
        <Analytics />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
