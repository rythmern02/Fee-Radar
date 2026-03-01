import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "../src/providers/QueryProvider";
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
  title: "Fee-Radar — Cross-Layer Cost Estimator",
  description:
    "Calculate the true cost of pegging out from Rootstock to Bitcoin. See L2 gas, bridge fees, and L1 miner fees in one breakdown.",
  keywords: [
    "Rootstock",
    "RSK",
    "Bitcoin",
    "PowPeg",
    "bridge",
    "fees",
    "peg-out",
    "cross-layer",
  ],
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
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
