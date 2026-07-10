import type { Metadata } from "next";
import { IBM_Plex_Mono, Orbitron } from "next/font/google";
import { Atmosphere } from "./components/Atmosphere";
import { SiteHeader } from "./components/SiteHeader";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://blog.justwats.com"),
  title: {
    default: "Payload | JustWats",
    template: "%s | JustWats",
  },
  description:
    "Field notes on malware analysis, threat hunting, digital forensics, and incident response by Justin Watson.",
  alternates: { canonical: "/" },
  other: { "codex-preview": "development" },
  openGraph: {
    title: "Payload | JustWats",
    description:
      "Field notes on malware analysis, threat hunting, digital forensics, and incident response.",
    url: "https://blog.justwats.com",
    siteName: "Payload",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${orbitron.variable} ${plexMono.variable}`}>
        <Atmosphere />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
