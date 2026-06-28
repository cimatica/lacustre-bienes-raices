import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getCurrentLanguage, getDictionary } from "../lib/i18n";
import { I18nProvider } from "@/app/components/I18nProvider";
import { AlertProvider } from "@/app/components/ui/AlertProvider";
import Script from "next/script";

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
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col font-display selection:bg-mosque selection:text-white bg-surface-darkest text-slate-200">
        <noscript>
          <iframe 
            src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        <I18nProvider dictionary={dict}>
          <AlertProvider>
            {children}
          </AlertProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
