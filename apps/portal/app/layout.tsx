import type { Metadata } from "next";
import type { ReactNode } from "react";
import "lenis/dist/lenis.css";
import "./globals.css";
import { SmoothScroll } from "./smooth-scroll";
import { BetaSignupProvider } from "./beta-signup";

export const metadata: Metadata = {
  title: "Finli — One clear money move at a time",
  description:
    "A calm financial companion for young salaried Indians to understand spending, build a safety fund, and take the next clear step.",
  openGraph: {
    title: "Finli — One clear money move at a time",
    description: "A calmer way to understand money, build a safety fund, and invest with context.",
    images: [{ url: "/branding/finli-website-thumbnail.png", width: 1672, height: 941, alt: "Finli financial clarity dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Finli — One clear money move at a time",
    description: "A calmer way to understand money, build a safety fund, and invest with context.",
    images: ["/branding/finli-website-thumbnail.png"],
  },
  icons: {
      icon: "/branding/finli-logo-monochrome.png",
      apple: "/branding/finli-logo-monochrome.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SmoothScroll />
        <BetaSignupProvider>{children}</BetaSignupProvider>
      </body>
    </html>
  );
}
