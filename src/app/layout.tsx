import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Toaster } from "react-hot-toast";
import GlobalAppLogic from "@/components/layout/GlobalAppLogic"; // Import GlobalAppLogic

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ETFCurator - Seu Curador Inteligente de ETFs",
  description: "Descubra, analise e compare ETFs de forma inteligente com o ETFCurator.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-white dark:bg-[#181A1B] text-[#1A1A1A] dark:text-gray-200`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GlobalAppLogic /> {/* Add GlobalAppLogic here */}
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}

