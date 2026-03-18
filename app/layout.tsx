import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BottomNavigation from "@/components/BottomNavigation";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/context/ThemeContext";
import { NotificationProvider } from "@/context/NotificationContext";
import FloatAIChatbot from "@/components/FloatAIChatbot";
import { Analytics } from "@vercel/analytics/react";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "StudyTrack - Gestion de travail étudiant",
  description: "Application de gestion de tâches et devoirs pour étudiants. Organisez vos études, suivez votre progression et boostez votre productivité.",
  keywords: ["étudiant", "gestion", "tâches", "devoirs", "pomodoro", "productivité"],
  manifest: "/manifest.json",
  icons: {
    apple: "/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${jakarta.variable} font-sans antialiased`}>
        <ThemeProvider>
          <NotificationProvider>
            <ErrorBoundary>
              <Navbar />
              <main className="min-h-[calc(100vh-4rem)] pb-20 md:pb-0">
                {children}
              </main>
              <FloatAIChatbot />
              <BottomNavigation />
              <Analytics />
            </ErrorBoundary>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
