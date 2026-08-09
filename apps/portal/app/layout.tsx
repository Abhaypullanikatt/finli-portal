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
