import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { siteConfig } from "../lib/site";

// Only the heading font is preloaded: it renders the LCP element (hero h1).
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter", preload: false });
const sourceSerif = localFont({
  src: "./fonts/source-serif-pro-latin-600-normal.woff2",
  weight: "600",
  display: "swap",
  variable: "--font-serif",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const metadata = {
  metadataBase: siteConfig.url,
  title: {
    default: siteConfig.title,
    template: "%s | Sark",
  },
  description: siteConfig.description,
  keywords: ["SEO agency", "technical SEO", "content strategy", "keyword research", "organic growth"],
  authors: [{ name: "Sark" }],
  creator: "Sark",
  publisher: "Sark",
  category: "marketing",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: "/",
    locale: "en_US",
    siteName: "Sark",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Sark SEO strategy for sustainable growth",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
