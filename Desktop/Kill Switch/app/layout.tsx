import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kill Switch | AI Security Copilot",
  description:
    "A premium AI security operations workspace for phishing triage, policy-gated actions, and audit-ready incident response.",
  applicationName: "Kill Switch",
  keywords: [
    "ArmorIQ",
    "ArmorClaw",
    "AI security agent",
    "incident response",
    "phishing triage",
    "hackathon",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
