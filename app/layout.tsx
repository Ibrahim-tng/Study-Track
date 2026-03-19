import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BottomNavigation from "@/components/BottomNavigation";
import { PageTransition } from "@/components/PageTransition";
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
    icon: "/icon.png",
    apple: "/icon.png",
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
  // Register Service Worker for PWA/Push
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").then(
        function (registration) {
          console.log("ServiceWorker registration successful with scope: ", registration.scope);
        },
        function (err) {
          console.log("ServiceWorker registration failed: ", err);
        }
      );
    });
  }

  return (
    <html lang="fr" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${jakarta.variable} font-sans antialiased`}>
        <ThemeProvider>
          <NotificationProvider>
            <ErrorBoundary>
              <Navbar />
              <main className="min-h-[calc(100vh-4rem)] pb-28 md:pb-0 pb-safe">
                <PageTransition>{children}</PageTransition>
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
