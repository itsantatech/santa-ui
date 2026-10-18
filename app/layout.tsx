import type { Metadata } from "next";
import Script from "next/script";
import { AppToastHost } from "@/components/app-toast-host";
import { siteUrl } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: "SantaTech | Industrial products and services", template: "%s | SantaTech" },
  description: "Industrial products and services from SantaTech.",
  robots: { index: true, follow: true },
  openGraph: { type: "website", siteName: "SantaTech" },
  alternates: {
    languages: {
      th: "/th",
      en: "/en",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <AppToastHost />
      </body>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-HRYC0DPTXM"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-HRYC0DPTXM');
        `}
      </Script>
    </html>
  );
}
