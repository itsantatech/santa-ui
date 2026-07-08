import type { Metadata } from "next";
import { AppToastHost } from "@/components/app-toast-host";
import "./globals.css";

export const metadata: Metadata = {
  title: "SantaTech",
  description: "Industrial products and services from SantaTech.",
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
    </html>
  );
}
