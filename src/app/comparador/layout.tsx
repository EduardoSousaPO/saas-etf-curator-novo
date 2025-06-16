import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Comparador de ETFs | ETF Curator",
  description: "Compare até 4 ETFs lado a lado, veja métricas detalhadas de performance, risco, dividendos e tome decisões informadas.",
  keywords: [
    "comparador de ETFs", "comparar ETFs", "performance ETFs", "risco ETFs", "dividendos ETFs", "dados em tempo real"
  ],
  openGraph: {
    title: "Comparador de ETFs | ETF Curator",
    description: "Compare até 4 ETFs lado a lado, veja métricas detalhadas de performance, risco, dividendos e tome decisões informadas.",
    url: "https://etfcurator.com.br/comparador",
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
    title: "Comparador de ETFs | ETF Curator",
    description: "Compare até 4 ETFs lado a lado, veja métricas detalhadas de performance, risco, dividendos e tome decisões informadas.",
    images: ["/image/visao_geral_planilha_etfs/etfcurator_og.png"]
  }
};

export default function ComparadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 