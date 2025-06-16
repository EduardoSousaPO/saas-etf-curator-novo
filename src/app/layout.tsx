import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/hooks/useAuth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ETF Curator - Curadoria Inteligente de ETFs",
  description: "Análise avançada de ETFs com dados em tempo real. Descubra, compare e otimize sua carteira de ETFs com inteligência de dados.",
  keywords: [
    "ETF", "investimento", "finanças", "renda variável", "fundos", "bolsa de valores", "curadoria de ETFs", "comparador de ETFs", "simulador de ETFs", "dados em tempo real"
  ],
  openGraph: {
    title: "ETF Curator - Curadoria Inteligente de ETFs",
    description: "Análise avançada de ETFs com dados em tempo real. Descubra, compare e otimize sua carteira de ETFs com inteligência de dados.",
    url: "https://etfcurator.com.br/",
    siteName: "ETF Curator",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/image/visao_geral_planilha_etfs/etfcurator_og.png",
        width: 1200,
        height: 630,
        alt: "ETF Curator - Curadoria Inteligente de ETFs",
        type: "image/png"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "ETF Curator - Curadoria Inteligente de ETFs",
    description: "Análise avançada de ETFs com dados em tempo real. Descubra, compare e otimize sua carteira de ETFs com inteligência de dados.",
    site: "@etfcurator",
    creator: "@etfcurator",
    images: [
      {
        url: "/image/visao_geral_planilha_etfs/etfcurator_og.png",
        width: 1200,
        height: 630,
        alt: "ETF Curator - Curadoria Inteligente de ETFs"
      }
    ]
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: "index, follow"
  },
  alternates: {
    canonical: "https://etfcurator.com.br/"
  },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }
    ],
    apple: [
      { url: "/apple-icon-180x180.png", sizes: "180x180", type: "image/png" }
    ]
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased min-h-screen`}>
        <AuthProvider>
          <div className="min-h-screen bg-white text-gray-900">
            {children}
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
        </AuthProvider>
      </body>
    </html>
  );
}

