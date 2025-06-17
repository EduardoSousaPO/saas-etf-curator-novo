import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { GlobalAppLogic } from '@/components/layout/GlobalAppLogic';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ETF Curator - Curadoria Inteligente de ETFs",
  description: "Plataforma completa para análise, comparação e simulação de ETFs com inteligência artificial",
  keywords: "ETF, investimentos, análise, simulação, curadoria, inteligência artificial",
  authors: [{ name: "ETF Curator Team" }],
  creator: "ETF Curator",
  publisher: "ETF Curator",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://etfcurator.vercel.app'),
  openGraph: {
    title: "ETF Curator - Curadoria Inteligente de ETFs",
    description: "Plataforma completa para análise, comparação e simulação de ETFs com inteligência artificial",
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://etfcurator.vercel.app',
    siteName: "ETF Curator",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ETF Curator - Curadoria Inteligente de ETFs',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "ETF Curator - Curadoria Inteligente de ETFs",
    description: "Plataforma completa para análise, comparação e simulação de ETFs com inteligência artificial",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <GlobalAppLogic />
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  maxWidth: '500px',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
                loading: {
                  iconTheme: {
                    primary: '#3b82f6',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

