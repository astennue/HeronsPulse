import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HeronPulse Academic OS | CCIS University of Makati",
  description: "A production-ready Academic Work Operating System for the College of Computing and Information Sciences at University of Makati. Manage tasks, track deadlines, and optimize your academic workflow.",
  keywords: ["HeronPulse", "University of Makati", "CCIS", "Academic", "Task Management", "Student Portal"],
  authors: [{ name: "CCIS University of Makati" }],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/logo.png",
  },
  openGraph: {
    title: "HeronPulse Academic OS",
    description: "Your Academic Workflow, Elevated.",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "HeronPulse Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "HeronPulse Academic OS",
    description: "Your Academic Workflow, Elevated.",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1A56DB" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0F1E" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased bg-background text-foreground`} suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

