import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Navbar from "@/components/navbar";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: "Yoga Wellness Tracker",
  description: "AI-powered yoga recommendations, real-time pose checking, meditation and live group sessions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="min-h-screen font-sans antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
