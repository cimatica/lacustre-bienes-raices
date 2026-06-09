import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getCurrentLanguage, getDictionary } from "../lib/i18n";
import { I18nProvider } from "./components/I18nProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lacustre - Bienes Raíces",
  description: "Encuentra tu santuario.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentLanguage = await getCurrentLanguage();
  const dict = await getDictionary();

  return (
    <html
      lang={currentLanguage}
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col font-display selection:bg-mosque selection:text-white bg-background-light text-nordic-dark">
        <I18nProvider dictionary={dict}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
