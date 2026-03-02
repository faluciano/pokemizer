import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pokemizer",
  description: "Build your Pokemon team with the randomizer card game",
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
      </body>
    </html>
  );
}
