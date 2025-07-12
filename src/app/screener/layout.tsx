import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Screener de ETFs | Vista",
  description: "Filtre, busque e explore ETFs americanos por performance, risco, dividendos e outros critérios. Screener avançado com dados em tempo real.",
  keywords: [
    "screener de ETFs", "busca de ETFs", "filtrar ETFs", "explorar ETFs", "dados em tempo real", "performance ETFs", "dividendos ETFs"
  ],
  openGraph: {
    title: "Screener de ETFs | Vista",
    description: "Filtre, busque e explore ETFs americanos por performance, risco, dividendos e outros critérios. Screener avançado com dados em tempo real.",
    url: "https://etfcurator.com.br/screener",
    siteName: "Vista",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/image/visao_geral_planilha_etfs/etfcurator_og.png",
        width: 1200,
        height: 630,
        alt: "Vista - Curadoria Inteligente de ETFs",
        type: "image/png"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Screener de ETFs | Vista",
    description: "Filtre, busque e explore ETFs americanos por performance, risco, dividendos e outros critérios. Screener avançado com dados em tempo real.",
    images: ["/image/visao_geral_planilha_etfs/etfcurator_og.png"]
  }
};

export default function ScreenerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 