import type { Metadata, Viewport } from "next";
import { Syne, Outfit } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";
import "../styles/contact-form.css";

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
    "Bespoke AI systems for businesses that need them to actually work. Measured to your operation, cut to your constraints, deployed into production. San Diego.",
  metadataBase: new URL("https://grantmahn.com"),
  alternates: { canonical: "/" },
  keywords: [
    "AI systems architect",
    "AI consultant",
    "bespoke AI",
    "production AI",
    "Grant Mahn",
    "San Diego AI consultant",
  ],
  openGraph: {
    title: "Grant Mahn — Systems Tailor",
    description:
      "Bespoke AI systems for businesses that need them to actually work. Measured. Cut. Deployed.",
    type: "website",
    locale: "en_US",
    url: "https://grantmahn.com",
    siteName: "Grant Mahn",
    // images: deliberately omitted — Next picks up opengraph-image.tsx by convention
  },
  twitter: {
    card: "summary_large_image",
    title: "Grant Mahn — Systems Tailor",
    description:
      "Bespoke AI systems for businesses that need them to actually work. Measured. Cut. Deployed.",
    // images: same — picked up automatically
  },
  robots: { index: true, follow: true },
  authors: [{ name: "Grant Mahn", url: "https://grantmahn.com" }],
  creator: "Grant Mahn",
};

export const viewport: Viewport = {
  themeColor: "#0E0A06",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${outfit.variable}`}>
      <head>
        <script
          type="application/x-comment"
          dangerouslySetInnerHTML={{
            __html: '\n  Built with Next.js, React 19, TypeScript. Syne + Outfit.\n  Measured, cut, and stitched by hand.\n  '
          }}
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <ThemeProvider />
        {children}
        <div className="grain-overlay" aria-hidden="true" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Grant Mahn",
              jobTitle: "Systems Tailor",
              description:
                "Bespoke AI systems for businesses that need them to actually work.",
              url: "https://grantmahn.com",
              address: {
                "@type": "PostalAddress",
                addressLocality: "San Diego",
                addressRegion: "CA",
                addressCountry: "US",
              },
              knowsAbout: [
                "AI systems architecture",
                "Large language models",
                "Production AI deployment",
                "AI for small business",
              ],
              sameAs: [
                "https://github.com/gmanawesomepants",
                "https://www.linkedin.com/in/grant-mahn",
                "https://www.instagram.com/grantmahn_/",
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
