import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ENIP · The anonymous network for IITians",
    template: "%s · ENIP",
  },
  description:
    "Connecting IITians for hiring, opportunities and guidance. Chat with seniors, prep for interviews and see placement stats.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <p className="bg-chip text-primary px-6 py-1.5 text-center text-xs font-medium">
          Preview build: all names, stories and numbers are sample data.
        </p>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
