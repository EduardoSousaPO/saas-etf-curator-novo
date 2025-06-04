import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Toaster } from "react-hot-toast";
import GlobalAppLogic from "@/components/layout/GlobalAppLogic"; // Import GlobalAppLogic
import Navbar from "@/components/layout/Navbar";
import AIChat from "@/components/assistant/AIChat";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ETF Curator - Curadoria Inteligente de ETFs",
  description: "Análise avançada de ETFs com dados em tempo real",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="">
      <body className={`${inter.variable} font-sans antialiased min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          forcedTheme="light"
        >
          <div className="min-h-screen bg-white text-gray-900">
            <GlobalAppLogic />
            <Navbar />
            {children}
            <AIChat />
          </div>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}

