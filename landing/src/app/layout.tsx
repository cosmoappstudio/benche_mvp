import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Benche — Modunu Yakala",
  description:
    "Günlük yaşam koçun ve eğlence rehberin. Moduna göre kişiselleştirilmiş öneriler: playlist, film, dizi, kitap, yemek ve aktivite.",
  icons: { icon: "/icon.png" },
  openGraph: {
    title: "Benche — Modunu Yakala",
    description:
      "Günlük yaşam koçun ve eğlence rehberin. Moduna göre kişiselleştirilmiş öneriler.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={outfit.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
