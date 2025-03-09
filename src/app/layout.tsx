import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteProvider } from "@/lib/context";
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
  title: "אתר דינמי מבוסס Google Sheets",
  description: "אתר דינמי המשתמש ב-Google Sheets כמסד נתונים",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // מזהה גיליון Google Sheets מתוך משתני הסביבה
  const spreadsheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || '';

  return (
    <html lang="he" dir="rtl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SiteProvider spreadsheetId={spreadsheetId}>
          {children}
        </SiteProvider>
      </body>
    </html>
  );
}
