import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "@/context/SettingsContext";
import { GlobalHeader } from "@/components/layout/GlobalHeader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Video OCR Studio",
  description: "Extract text from videos using client-side OCR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body
        className={`${inter.className} antialiased bg-background text-foreground h-screen w-screen flex flex-col overflow-hidden`}
      >
        <SettingsProvider>
          <GlobalHeader />
          {/* Main content wrapper - takes remaining height */}
          <div className="flex-1 overflow-hidden relative">
            {children}
          </div>
        </SettingsProvider>
      </body>
    </html>
  );
}
