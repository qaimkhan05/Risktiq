import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";

import "@/app/globals.css";

import { ThemeProvider } from "@/components/layout/theme-provider";

const themeInitScript = `
  (function () {
    try {
      var storedTheme = window.localStorage.getItem("risktiq-theme") || window.localStorage.getItem("tradecraft-theme");
      var systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      var theme = storedTheme || systemTheme;
      var root = document.documentElement;
      root.classList.toggle("dark", theme === "dark");
      root.dataset.theme = theme;
      root.style.colorScheme = theme;
    } catch (error) {}
  })();
`;

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans"
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  title: "Risktiq",
  description: "Risktiq is a premium trading journal SaaS for disciplined execution, analytics, and growth."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${manrope.variable} ${sora.variable} font-sans antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
