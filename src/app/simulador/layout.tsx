import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Simulador de Carteira | ETF Curator",
  description: "Monte e simule carteiras de ETFs, ajuste alocações e veja métricas de risco e retorno em tempo real. Ferramenta avançada para investidores.",
  keywords: [
    "simulador de ETFs", "simulação de carteira", "alocação de ativos", "risco e retorno", "dados em tempo real", "investimento em ETFs"
  ],
  openGraph: {
    title: "Simulador de Carteira | ETF Curator",
    description: "Monte e simule carteiras de ETFs, ajuste alocações e veja métricas de risco e retorno em tempo real. Ferramenta avançada para investidores.",
    url: "https://etfcurator.com.br/simulador",
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
    title: "Simulador de Carteira | ETF Curator",
    description: "Monte e simule carteiras de ETFs, ajuste alocações e veja métricas de risco e retorno em tempo real. Ferramenta avançada para investidores.",
    images: ["/image/visao_geral_planilha_etfs/etfcurator_og.png"]
  }
};

export default function SimuladorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 