import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const sans = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Evolve Wholesale — Used Phones at Wholesale Prices",
    template: "%s · Evolve Wholesale",
  },
  description:
    "Wholesale used phones for local retailers and repair shops. Browse live, graded inventory and order for local delivery.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="antialiased">
        <NuqsAdapter>{children}</NuqsAdapter>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
