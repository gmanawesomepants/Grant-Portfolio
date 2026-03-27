import type { Metadata } from "next";
import { Syne, Outfit } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";

const syne = Syne({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Grant Mahn — Systems Tailor",
  description:
    "AI systems architect. I build AI systems that actually work. Measured. Cut. Deployed.",
  metadataBase: new URL("https://grantmahn.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Grant Mahn — Systems Tailor",
    description:
      "AI systems architect. I build AI systems that actually work.",
    type: "website",
    locale: "en_US",
    url: "https://grantmahn.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Grant Mahn — Systems Tailor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grant Mahn — Systems Tailor",
    description:
      "AI systems architect. I build AI systems that actually work.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${outfit.variable}`}>
      <body>
        <ThemeProvider />
        {children}
        <div className="grain-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
