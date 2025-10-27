import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Amazon FBA Profitability Calculator",
  description: "Comprehensive Amazon FBA fee calculator with product analysis and profitability insights",
  keywords: ["Amazon", "FBA", "Profitability", "Calculator", "Fees", "Seller Central"],
  authors: [{ name: "FBA Calculator Team" }],
  openGraph: {
    title: "Amazon FBA Profitability Calculator",
    description: "Analyze your products' profitability with comprehensive fee calculations",
    url: "https://chat.z.ai",
    siteName: "FBA Calculator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amazon FBA Profitability Calculator",
    description: "Analyze your products' profitability with comprehensive fee calculations",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
