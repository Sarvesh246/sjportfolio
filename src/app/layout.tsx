import type { Metadata } from "next";
import { Archivo, Archivo_Black, Space_Mono } from "next/font/google";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Ticker } from "@/components/ticker";
import { getPortfolio } from "@/lib/github";
import "./globals.css";

const archivoBlack = Archivo_Black({ weight: "400", subsets: ["latin"], variable: "--font-archivo-black", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });
const spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-space-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Sarvesh Jagtap — I build cool stuff", template: "%s · Sarvesh Jagtap" },
  description: "Local-first apps, AI agents that don’t fall over, and the web around them. Everything pulled straight from GitHub.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { user } = await getPortfolio();
  return (
    <html lang="en" className={`${archivoBlack.variable} ${archivo.variable} ${spaceMono.variable}`}>
      <body>
        <Ticker />
        <Nav />
        {children}
        <Footer user={user} />
      </body>
    </html>
  );
}
