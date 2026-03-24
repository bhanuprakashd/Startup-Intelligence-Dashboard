import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WSI - World Startup Intelligence",
    template: "%s | WSI",
  },
  description: "AI-powered startup intelligence platform. Validate ideas, find investors, analyze competitors, generate pitch decks — all backed by live market data from Reddit, GitHub, HackerNews, and more.",
  keywords: [
    "startup intelligence",
    "idea validation",
    "startup ideas",
    "investor matching",
    "competitive analysis",
    "pitch deck generator",
    "startup tools",
    "market research",
    "AI startup assistant",
    "venture capital",
  ],
  authors: [{ name: "WSI - World Startup Intelligence" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "WSI - World Startup Intelligence",
    title: "WSI - World Startup Intelligence",
    description: "From zero to startup in minutes. AI-powered platform with 13 intelligence tools backed by live market data.",
  },
  twitter: {
    card: "summary_large_image",
    title: "WSI - World Startup Intelligence",
    description: "From zero to startup in minutes. 13 AI tools, live market data, zero cost to start.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <QueryProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
