import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ConversationProvider } from "@/lib/contexts/ConversationContext";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { PageTracking } from "@/components/tracking/PageTracking";
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
  title: "Orion Analytics Dashboard",
  description: "Multi-source analytics dashboard",
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
        <SessionProvider>
          <QueryProvider>
            <ConversationProvider>
              <PageTracking />
              {children}
            </ConversationProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
