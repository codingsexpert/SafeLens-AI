import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "SafeLens AI | AI-Powered Security Intelligence",
  description:
    "Enterprise-grade AI security operations platform for phishing detection, threat analysis, and incident response. Protect your organization with intelligent triage.",
  applicationName: "SafeLens AI",
  keywords: [
    "AI security",
    "phishing detection",
    "threat analysis",
    "security operations",
    "incident response",
    "enterprise security",
  ],
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">{children}</body>
    </html>
  );
}
